import { NextRequest, NextResponse } from 'next/server';
import { exportFullJsonDataset, exportJsonlFineTuningDataset, exportCsvDataset } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (format === 'jsonl') {
      const jsonlData = exportJsonlFineTuningDataset();
      return new NextResponse(jsonlData, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-jsonlines; charset=utf-8',
          'Content-Disposition': `attachment; filename="nhiep-net-ai-training-dataset-${timestamp}.jsonl"`
        }
      });
    }

    if (format === 'csv') {
      const csvData = exportCsvDataset();
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="nhiep-net-leads-and-bookings-${timestamp}.csv"`
        }
      });
    }

    // Default: Full JSON Backup
    const fullJson = exportFullJsonDataset();
    return new NextResponse(JSON.stringify(fullJson, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="nhiep-net-database-backup-${timestamp}.json"`
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
