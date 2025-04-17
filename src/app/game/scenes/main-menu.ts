import { GameObjects, Scene } from "phaser";
import { PageSpeedResult } from "../../api/pagespeed/route";

import { EventBus } from "../event-bus";

const centerX = 1512 / 2;
const centerY = 857 / 2;

export class MainMenu extends Scene {
    background: GameObjects.Image | null;
    logo: GameObjects.Image | null;
    title: GameObjects.Text | null;
    logoTween: Phaser.Tweens.Tween | null;
    urls: string[] | null;
    pageSpeedResults: PageSpeedResult[] | null;

    constructor() {
        super("MainMenu");
        // this.background = null; // Provide a default image or use null
        // this.logo = null; // Provide a default image or use null
        // this.title = null; // Provide default text
        // this.logoTween = null;
        // this.urls = [];
        // this.pageSpeedResults = [];
    }

    create() {
        this.background = this.add.image(centerX, centerY, "background");
        this.background.setAlpha(0.5);
        this.logo?.setTexture("logo");
        this.logo?.setPosition(centerX, 200);
        this.logo?.setScale(0.25);

        this.title?.setText("Jogar");
        this.title?.setPosition(centerX, 460);
        this.title?.setFontFamily("Arial Black");
        this.title?.setFontSize(38);
        this.title?.setColor("#ffffff");
        this.title?.setStroke("#000000", 8);
        this.title?.setAlign("center");
        this.title?.setOrigin(0.5);
        this.title?.setDepth(100);

        EventBus.emit("current-scene-ready", this);

        EventBus.on("set-urls", (urls: string[]) => {
            this.urls = urls;
            console.log("URLs received in MainMenu:", this.urls);
            this.fetchPageSpeedData(this.urls);
        });

        EventBus.emit("current-scene-ready", this);
    }

    async fetchPageSpeedData(urls: string[]) {
        const response = await fetch("/api/pagespeed", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ urls }),
        });

        const data = (await response.json()) as PageSpeedResult[];
        console.log("PageSpeed data:", data);
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start("Game");
        EventBus.emit("set-page-speed-results", this.pageSpeedResults);
    }

    moveLogo(reactCallback: ({ x, y }: { x: number; y: number }) => void) {
        if (this.logoTween) {
            if (this.logoTween.isPlaying()) {
                this.logoTween.pause();
            } else {
                this.logoTween.play();
            }
        } else {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: "Back.easeInOut" },
                y: { value: 80, duration: 1500, ease: "Sine.easeOut" },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (reactCallback) {
                        reactCallback({
                            x: Math.floor(this.logo?.x ?? 0),
                            y: Math.floor(this.logo?.y ?? 0),
                        });
                    }
                },
            });
        }
    }
}
