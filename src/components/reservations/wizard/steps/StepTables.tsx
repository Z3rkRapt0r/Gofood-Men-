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

    const allocatedSeats = (data.tables || []).reduce((acc, table) => acc + table.seats, 0);
    const remainingSeats = (data.totalSeats || 0) - allocatedSeats;

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-4 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-medium">Layout e Tavoli</h3>
                        <p className="text-sm text-muted-foreground">
                            Crea i tavoli fino a coprire i <strong>{data.totalSeats} posti totali</strong>.
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

                {/* Capacity Progress Bar */}
                <div className="bg-muted/40 p-4 rounded-lg border border-border">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Posti Assegnati: <strong>{allocatedSeats}</strong> / {data.totalSeats}</span>
                        <span className={remainingSeats < 0 ? "text-red-500 font-bold" : "text-muted-foreground"}>
                            {remainingSeats < 0 ? `${Math.abs(remainingSeats)} in eccesso!` : `${remainingSeats} da assegnare`}
                        </span>
                    </div>
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${remainingSeats < 0 ? 'bg-red-500 w-full' :
                                remainingSeats === 0 ? 'bg-green-500' : 'bg-primary'
                                }`}
                            style={{ width: remainingSeats < 0 ? '100%' : `${(allocatedSeats / (data.totalSeats || 1)) * 100}%` }}
                        ></div>
                    </div>
                    {remainingSeats === 0 && (
                        <p className="text-xs text-green-600 mt-2 font-medium flex items-center">
                            ✓ Capienza completata correttamente!
                        </p>
                    )}
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
