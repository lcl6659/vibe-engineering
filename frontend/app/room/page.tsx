"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, ArrowRight } from "lucide-react";

/**
 * Room Entry Page
 * Allows users to create or join a video room
 */
export default function RoomPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  const handleCreateRoom = () => {
    // Generate a random room ID
    const newRoomId = Math.random().toString(36).substring(2, 12);
    router.push(`/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Video className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Real-time Video Conference
          </h1>
          <p className="text-lg text-muted-foreground">
            Start a video call with anyone, instantly. No downloads required.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-8">
          {/* Create new room */}
          <div className="bg-card rounded-2xl p-8 border-0">
            <h2 className="text-xl font-semibold mb-3">Start a new meeting</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create a new room and share the link with others
            </p>
            <Button
              onClick={handleCreateRoom}
              size="lg"
              className="w-full h-14 rounded-xl border-0 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Video className="w-5 h-5 mr-2" />
              Create Room
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          {/* Join existing room */}
          <div className="bg-card rounded-2xl p-8 border-0">
            <h2 className="text-xl font-semibold mb-3">Join a meeting</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Enter the room ID to join an existing meeting
            </p>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleJoinRoom();
                  }
                }}
                className="h-14 rounded-xl border-0 bg-muted px-4 focus:bg-background focus:outline-none"
              />
              <Button
                onClick={handleJoinRoom}
                disabled={!roomId.trim()}
                size="lg"
                className="h-14 px-8 rounded-xl border-0 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                Join
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All video and audio streams are real-time and peer-to-peer.
            <br />
            No recordings are saved.
          </p>
        </div>
      </div>
    </div>
  );
}
