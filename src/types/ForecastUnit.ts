export interface ForecastUnit {
    readonly clouds: {
        readonly all: number;
    };
    readonly dt: number;
    readonly dt_txt: string;
    readonly main: {
        readonly feels_like: number;
        readonly grnd_level: number;
        readonly humidity: number;
        readonly pressure: number;
        readonly sea_level: number;
        readonly temp: number;
        readonly temp_kf: number;
        readonly temp_max: number;
        readonly temp_min: number;
    };
    readonly pop: number;
    readonly sys: {
        readonly pod: string;
    };
    readonly visibility: number;
    readonly weather: [
        {
            readonly description: string;
            readonly icon: string;
            readonly id: number;
            readonly main: string;
        }
    ];
    readonly wind: {
        readonly deg: number;
        readonly gust: number;
        readonly speed: number;
    };
    weekday?: number;
}