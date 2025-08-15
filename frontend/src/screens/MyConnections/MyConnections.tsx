import {JSX, useState} from "react";
import {NavigationBarMainByAnima} from "../LandingPage/sections/NavigationBarMainByAnima";
import {SearchWrapperByAnima} from "../LandingPage/sections/SearchWrapperByAnima";
import {CategoryFilterByAnima} from "../LandingPage/sections/CategoryFilterByAnima/CategoryFilterByAnima";
import {FrameByAnima} from "../LandingPage/sections/FrameByAnima";

export const MyConnections = (): JSX.Element => {
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [noPagination, setNoPagination] = useState(false);

    return (
        <div className="min-h-screen bg-foreground/5">
            <header className="">
                <NavigationBarMainByAnima/>
                <SearchWrapperByAnima
                    setSearch={(val) => {
                        val && setNoPagination(true);
                        setSearch(val)
                    }}
                    setSelectedCountry={(val) => {
                        val && setNoPagination(true)
                        setSelectedCountry(val)
                    }}
                />
            </header>

            <main className="mx-6">
                <section className="">
                    <CategoryFilterByAnima
                        setSelectedCategories={(val) => {
                            val && setNoPagination(true)
                            setSelectedCategories(val)
                        }}
                    />
                </section>
                <section className="flex flex-row gap-4">
                    <div className="flex-1">
                        <FrameByAnima
                            search={search}
                            selectedCategories={selectedCategories}
                            selectedCountry={selectedCountry}
                            hasConnection={true}
                            noPagination={noPagination}
                            setNoPagination={setNoPagination}
                        />
                    </div>
                </section>
                <section></section>
            </main>
        </div>
    );
};
