"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

/**
 * 清理页面 - 用于清理损坏的认证数据
 * 访问路径：/auth/clear
 */
export default function ClearAuthPage() {
  const router = useRouter();
  const [cleared, setCleared] = useState(false);

  const handleClear = () => {
    // Clear all auth-related data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('google_oauth_token');
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_token_expiry');
    sessionStorage.clear();
    
    setCleared(true);
  };

  const handleContinue = () => {
    router.push('/auth');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9]">
      <div className="text-center max-w-md px-6">
        {!cleared ? (
          <>
            <div className="mb-8 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center">
                <Trash2 className="h-10 w-10 text-orange-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4">清理认证数据</h1>
            
            <p className="text-muted-foreground mb-8">
              如果遇到登录问题或错误，可以清理所有认证数据并重新开始。
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 text-left">
              <p className="text-sm text-yellow-800">
                <strong>警告：</strong>此操作将清除：
              </p>
              <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                <li>系统认证令牌</li>
                <li>Google OAuth 令牌</li>
                <li>用户信息</li>
                <li>所有会话数据</li>
              </ul>
            </div>

            <Button
              size="lg"
              variant="destructive"
              onClick={handleClear}
              className="w-full rounded-xl"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              清理所有数据
            </Button>
          </>
        ) : (
          <>
            <div className="mb-8 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4">清理完成</h1>
            
            <p className="text-muted-foreground mb-8">
              所有认证数据已清除。您现在可以重新进行授权。
            </p>

            <Button
              size="lg"
              onClick={handleContinue}
              className="w-full rounded-xl"
            >
              前往授权页面
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
