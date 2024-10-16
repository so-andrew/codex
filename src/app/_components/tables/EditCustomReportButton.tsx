import { Button } from '@/components/ui/button'
import { type ReportType } from '@/types'
import { useState } from 'react'
import GenericDialog from '../dialogs/GenericDialog'
import EditCustomReportForm from '../forms/EditCustomReportForm'

export default function EditCustomReportButton({
    report,
}: {
    report: ReportType
}) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    return (
        <>
            <GenericDialog
                isOpen={isEditOpen}
                setIsOpen={setIsEditOpen}
                title="Edit Custom Report"
                className="sm:max-w-lg p-8"
            >
                <EditCustomReportForm
                    report={report}
                    setIsOpen={setIsEditOpen}
                />
            </GenericDialog>
            <Button
                variant="ghost"
                className="hover:bg-transparent p-0 text-blue-500"
                onClick={() => setIsEditOpen(!isEditOpen)}
            >
                {report.name}
            </Button>
        </>
    )
}
