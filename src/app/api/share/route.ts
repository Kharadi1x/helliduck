import { saveResult, getResult } from "@/lib/storage";
import { generateId } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const { type, data } = body;

  if (!type || !data) {
    return Response.json({ error: "Missing type or data" }, { status: 400 });
  }

  const id = generateId();
  saveResult(id, type, data);

  return Response.json({ id, url: `/s/${id}` });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  const result = getResult(id);
  if (!result) {
    return Response.json({ error: "Not found or expired" }, { status: 404 });
  }

  return Response.json(result);
}
