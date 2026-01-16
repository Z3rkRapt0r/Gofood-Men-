import { ReservationConfig, TableConfig } from "../../types";
import { RoomLayoutEditor } from "../../RoomLayoutEditor";

interface StepTablesProps {
    data: ReservationConfig;
    updateData: (data: Partial<ReservationConfig>) => void;
}

export function StepTables({ data, updateData }: StepTablesProps) {
    const updateTables = (newTables: TableConfig[]) => {
        updateData({ tables: newTables });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-medium">Layout e Tavoli</h3>
                    <p className="text-sm text-muted-foreground">
                        Definisci i tavoli del tuo locale. Verranno visualizzati in una griglia ordinata.
                    </p>
                </div>
            </div>

            <RoomLayoutEditor
                tables={data.tables}
                onUpdateTables={updateTables}
                mode="edit"
            />
        </div>
    );
}
