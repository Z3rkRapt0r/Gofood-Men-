import { ReservationConfig, TableConfig } from "../../types";
import { RoomLayoutEditor } from "../../RoomLayoutEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
            <div className="flex flex-col space-y-6 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-medium">Mappa del locale</h3>
                        <p className="text-sm text-muted-foreground">
                            Inserisci i tavoli che compongono il locale.
                        </p>
                    </div>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/20 rounded-xl border">
                    <div className="space-y-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="totalHighChairs" className="flex gap-1 font-bold">
                                Seggiolini per bambini <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="number"
                                id="totalHighChairs"
                                min="0"
                                placeholder="Es. 5"
                                value={data.totalHighChairs || ""}
                                onChange={(e) => updateData({ totalHighChairs: parseInt(e.target.value) || 0 })}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Indica quanti seggiolini hai in totale.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border shadow-sm self-center">
                        <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Posti TOTALI</span>
                        <div className="text-4xl font-black text-primary flex items-end gap-2 leading-none">
                            {allocatedSeats} <span className="text-lg font-medium text-muted-foreground pb-0.5">posti</span>
                        </div>
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
