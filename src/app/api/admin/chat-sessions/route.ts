import { NextRequest, NextResponse } from 'next/server';
import { getChatSessions, deleteChatSession } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase();
    const status = searchParams.get('status');

    let sessions = getChatSessions();

    if (status && status !== 'all') {
      sessions = sessions.filter((s) => s.status === status);
    }

    if (search) {
      sessions = sessions.filter(
        (s) =>
          s.sessionId.toLowerCase().includes(search) ||
          (s.customerInfo.name && s.customerInfo.name.toLowerCase().includes(search)) ||
          (s.customerInfo.phone && s.customerInfo.phone.toLowerCase().includes(search)) ||
          (s.customerInfo.email && s.customerInfo.email.toLowerCase().includes(search)) ||
          (s.scriptSummary && s.scriptSummary.toLowerCase().includes(search)) ||
          s.messages.some((m) => m.content.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ success: true, data: sessions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu Session ID' }, { status: 400 });
    }

    const deleted = deleteChatSession(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy phiên chat' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa phiên chat thành công' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
