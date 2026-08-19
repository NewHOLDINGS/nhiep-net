import { NextRequest, NextResponse } from 'next/server';
import { updateBookingStatus, deleteBooking } from '@/lib/storage';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Trạng thái không hợp lệ' }, { status: 400 });
    }

    const updated = updateBookingStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy lịch đặt' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const success = deleteBooking(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy lịch đặt' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Đã xóa thành công' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
