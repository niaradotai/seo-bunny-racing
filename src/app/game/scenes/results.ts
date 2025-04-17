import { Scene } from "phaser";
import { PageSpeedResult } from "../../api/pagespeed/route";

interface ResultsData {
    pageSpeedResults: PageSpeedResult[];
}

export class Results extends Scene {
    pageSpeedResults: PageSpeedResult[];

    constructor() {
        super("Results");
        this.pageSpeedResults = [];
    }

    init(data: ResultsData) {
        this.pageSpeedResults = data.pageSpeedResults;
    }
    create() {
        this.add.text(100, 100, "Results Scene", { fontSize: "32px" });

        const sortedResults = [...this.pageSpeedResults].sort(
            (a, b) => b.score - a.score
        );
        const winner = sortedResults[0];

        this.add.text(
            100,
            200,
            `Winner: ${winner.url} - Score: ${winner.score}`,
            { fontSize: "24px" }
        );

        let y = 300;
        sortedResults.forEach((result) => {
            this.add.text(100, y, `${result.url} - Score: ${result.score}`, {
                fontSize: "18px",
            });
            y += 30;
        });
    }
}
