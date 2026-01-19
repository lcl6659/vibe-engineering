"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { youtubeApi } from "@/lib/api/endpoints";
import { toast } from "@/lib/utils/toast";

export default function AuthPanel() {
  const [loading, setLoading] = useState(false);

  // Clean up any corrupted auth data on mount
  useEffect(() => {
    try {
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        // Check if it was stored as JSON (incorrect format)
        if (authToken.startsWith('{') || authToken.startsWith('[') || authToken.startsWith('"')) {
          console.warn('Cleaning up corrupted auth_token');
          localStorage.removeItem('auth_token');
        }
      }
    } catch (e) {
      // Ignore errors
    }
  }, []);

  const handleAuth = async () => {
    setLoading(true);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/a127609d-0110-4a4e-83ea-2be1242c90c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthPanel.tsx:handleAuth:start',message:'handleAuth called',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,D,E'})}).catch(()=>{});
    // #endregion
    try {
      const { url } = await youtubeApi.getAuthUrl();
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/a127609d-0110-4a4e-83ea-2be1242c90c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthPanel.tsx:handleAuth:success',message:'getAuthUrl succeeded',data:{url},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,E'})}).catch(()=>{});
      // #endregion
      if (!url) {
        toast.error("OAuth 未配置。请检查后端环境变量 GOOGLE_CLIENT_ID 和 GOOGLE_CLIENT_SECRET");
        setLoading(false);
        return;
      }
      window.location.href = url;
    } catch (e: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/a127609d-0110-4a4e-83ea-2be1242c90c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthPanel.tsx:handleAuth:error',message:'getAuthUrl failed',data:{error:e instanceof Error ? e.message : String(e), errorName: e instanceof Error ? e.name : 'unknown'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,C,D'})}).catch(()=>{});
      // #endregion
      
      // 显示更详细的错误信息
      let errorMessage = "授权初始化失败";
      if (e?.message) {
        if (e.message.includes("OAuth 配置缺失")) {
          errorMessage = "Google OAuth 未配置。请联系管理员配置 GOOGLE_CLIENT_ID 和 GOOGLE_CLIENT_SECRET";
        } else if (e.message.includes("网络")) {
          errorMessage = "网络连接失败。请检查后端服务是否正常运行";
        } else {
          errorMessage = e.message;
        }
      }
      
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-700">
      <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-8">
        <ShieldCheck className="h-10 w-10 text-primary" />
      </div>
      <Button
        size="lg"
        onClick={handleAuth}
        disabled={loading}
        className="rounded-xl h-14 px-10 bg-primary text-primary-foreground hover:bg-primary/90 border-0 active:scale-[0.98] transition-all"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Authorize with Google
            <ExternalLink className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}