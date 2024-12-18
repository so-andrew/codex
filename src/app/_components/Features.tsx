import { Calendar, ChartPie, ScanBarcode } from 'lucide-react'

export const Features = () => {
    return (
        <section className="flex flex-col items-center bg-purple-500/25">
            <div className="max-w-[1440px] w-full h-full px-20 py-16 flex flex-col gap-24 items-center lg:grid lg:grid-cols-3 lg:items-start my-20">
                <div className="flex flex-col items-center text-center gap-6 max-w-md">
                    <ScanBarcode className="text-purple-500" size={100} />
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-semibold">
                            Manage Products
                        </h2>
                        <p>
                            {
                                'Set up your library by creating listings for products. Organize your products into categories. Define bundle deals (i.e. buy one get one free) as custom discounts.'
                            }
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-center text-center gap-6 max-w-md">
                    <Calendar className="text-purple-500" size={100} />
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-semibold">Track Sales</h2>
                        <p>
                            Codex tracks your sales by event, so you can see how
                            well you are doing in real time. View payment type
                            breakdowns, revenue by day, and more.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-center text-center gap-6 max-w-md">
                    <ChartPie className="text-purple-500" size={100} />
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-semibold">View Stats</h2>
                        <p>
                            View your total revenue for a given period and
                            compare with previous periods. View your top selling
                            products and categories, as well as payment type
                            breakdowns.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
