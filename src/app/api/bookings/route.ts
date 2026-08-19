import { NextRequest, NextResponse } from 'next/server';
import { getBookings, saveBooking } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();
    const provinceId = searchParams.get('provinceId');
    const categoryId = searchParams.get('categoryId');

    let list = getBookings();

    if (status && status !== 'all') {
      list = list.filter((b) => b.status === status);
    }
    if (provinceId && provinceId !== 'all') {
      list = list.filter((b) => b.provinceId === provinceId);
    }
    if (categoryId && categoryId !== 'all') {
      list = list.filter((b) => b.categoryId === categoryId);
    }
    if (search) {
      list = list.filter(
        (b) =>
          b.customerName.toLowerCase().includes(search) ||
          b.phone.toLowerCase().includes(search) ||
          b.bookingCode.toLowerCase().includes(search) ||
          b.packageName.toLowerCase().includes(search) ||
          b.email.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.customerName || !body.phone || !body.packageId || !body.shootDate) {
      return NextResponse.json(
        { success: false, error: 'Thiếu các thông tin bắt buộc (Họ tên, SĐT, Gói, Ngày chụp)' },
        { status: 400 }
      );
    }

    const created = saveBooking({
      customerName: body.customerName,
      phone: body.phone,
      email: body.email || '',
      zaloOrWhatsapp: body.zaloOrWhatsapp || body.phone,
      categoryId: body.categoryId || 'photography',
      packageId: body.packageId,
      packageName: body.packageName || 'Gói Dịch Vụ nhiep.net',
      provinceId: body.provinceId || 'danang',
      shootDate: body.shootDate,
      shootTime: body.shootTime || '08:00',
      shootAddress: body.shootAddress || '',
      notes: body.notes || '',
      addOns: body.addOns || [],
      estimatedTotalVnd: Number(body.estimatedTotalVnd) || 0
    });

    return NextResponse.json({ success: true, data: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
