"use client";

import { useState, useCallback, useEffect } from "react";
import { insightApi } from "@/lib/api/endpoints";
import type { Highlight, CreateHighlightRequest } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

/**
 * Hook for managing highlights for an insight
 * @param insightId - The insight ID
 * @returns Highlights state and CRUD operations
 */
export function useHighlights(insightId: number) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch highlights
  const fetchHighlights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await insightApi.getHighlights(insightId);
      setHighlights(response.highlights || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load highlights");
      }
    } finally {
      setLoading(false);
    }
  }, [insightId]);

  // Create a new highlight
  const createHighlight = useCallback(
    async (data: CreateHighlightRequest): Promise<Highlight | null> => {
      setError(null);
      try {
        const newHighlight = await insightApi.createHighlight(insightId, data);
        setHighlights((prev) => [...prev, newHighlight]);
        return newHighlight;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to create highlight");
        }
        return null;
      }
    },
    [insightId]
  );

  // Delete a highlight
  const deleteHighlight = useCallback(
    async (highlightId: number): Promise<boolean> => {
      setError(null);
      try {
        await insightApi.deleteHighlight(insightId, highlightId);
        setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to delete highlight");
        }
        return false;
      }
    },
    [insightId]
  );

  // Load highlights on mount
  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  return {
    highlights,
    loading,
    error,
    createHighlight,
    deleteHighlight,
    refetch: fetchHighlights,
  };
}
