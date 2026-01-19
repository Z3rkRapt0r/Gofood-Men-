import { ReservationConfig, TableConfig } from "../../types";
import { RoomLayoutEditor } from "../../RoomLayoutEditor";

interface StepTablesProps {
    data: ReservationConfig;
    updateData: (data: Partial<ReservationConfig>) => void;
}

export function StepTables({ data, updateData }: StepTablesProps) {
    const updateTables = (newTables: TableConfig[]) => {
        const newTotalSeats = newTables.reduce((acc, t) => acc + t.seats, 0);
        updateData({ tables: newTables, totalSeats: newTotalSeats });
    };

    const allocatedSeats = (data.tables || []).reduce((acc, table) => acc + table.seats, 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-4 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-medium">Layout e Tavoli</h3>
                        <p className="text-sm text-muted-foreground">
                            Configura i tavoli del tuo locale. La <strong>capacità totale</strong> verrà calcolata automaticamente.
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-semibold mb-1">
                            Jolly Disponibili
                        </div>
                        <div className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-200">
                            🧸 {data.totalHighChairs || 0} Seggiolini
                        </div>
                    </div>
                </div>

                {/* Capacity Summary */}
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex flex-col items-center justify-center text-center">
                    <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Capacità Totale Configurata</span>
                    <div className="text-3xl font-bold text-primary flex items-end gap-2 leading-none">
                        {allocatedSeats} <span className="text-lg font-medium text-muted-foreground pb-0.5">posti</span>
                    </div>
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
