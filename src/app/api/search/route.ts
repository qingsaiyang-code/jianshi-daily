/** 接口预留：不返回虚构的联网结果，不接受客户端密钥。 */
export async function POST() {
  return Response.json({ code: "SEARCH_NOT_CONFIGURED", message: "联网问答尚未接入。当前可以使用站内搜索。" }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
