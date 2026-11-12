import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@/lib/supabase/server";

const R2_ENDPOINT =
  process.env.R2_ENDPOINT ??
  "https://705cbf73065615c9e1cb4fed5b3803b9.r2.cloudflarestorage.com";
const R2_ACCESS_KEY_ID =
  process.env.R2_ACCESS_KEY_ID ?? "24354fd4344fc64008b93c93ab7a7168";
const R2_SECRET_ACCESS_KEY =
  process.env.R2_SECRET_ACCESS_KEY ??
  "26dce9a4ec7452e7d88058aaafeb7e588c84b1a8a045e0899f6c6cb4e519cb4d";
const R2_BUCKET = process.env.R2_BUCKET ?? "drama-videos";
const R2_PUBLIC_BASE = (
  process.env.R2_PUBLIC_BASE ??
  "https://pub-badf9516e729428daead5062ca228a4d.r2.dev"
).replace(/\/$/, "");

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * 產生 R2 的預簽上傳網址（瀏覽器直接把影片 PUT 到 R2，不經過伺服器）
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  let body: { workId?: string; fileName?: string; contentType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  const workId = (body.workId ?? "").trim();
  if (!workId) {
    return NextResponse.json({ error: "缺少作品 ID" }, { status: 400 });
  }

  // 確認作品確實屬於這位使用者，避免幫別人的作品上傳
  const { data: work } = await supabase
    .from("works")
    .select("id, author_id")
    .eq("id", workId)
    .single();
  if (!work || work.author_id !== user.id) {
    return NextResponse.json({ error: "無權上傳此作品" }, { status: 403 });
  }

  const rawName = (body.fileName ?? "video.mp4").split(/[\\/]/).pop() ?? "video.mp4";
  const safeName = rawName.replace(/[^\w.\-]/g, "_").slice(-60) || "video.mp4";
  const key = `drama/${workId}/${Date.now()}-${safeName}`;
  const contentType = body.contentType || "video/mp4";

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

  return NextResponse.json({
    uploadUrl,
    key,
    publicUrl: `${R2_PUBLIC_BASE}/${key}`,
  });
}
