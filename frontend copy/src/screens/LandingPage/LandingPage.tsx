import {JSX, useState} from "react";
import {CategoryFilterByAnima} from "./sections/CategoryFilterByAnima/CategoryFilterByAnima";
import {FrameByAnima} from "./sections/FrameByAnima";
import {NavigationBarMainByAnima} from "./sections/NavigationBarMainByAnima";
import {PromoteProfilesByAnima} from "./sections/PromoteProfilesByAnima";
import {SearchWrapperByAnima} from "./sections/SearchWrapperByAnima";
import {useAuth} from "../../lib/hooks/useAuth.ts";

export const LandingPage = (): JSX.Element => {
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [noPagination, setNoPagination] = useState(false);
    const {user} = useAuth();

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

                {user && <section className="">
                    <PromoteProfilesByAnima
                        search={search}
                        selectedCategories={selectedCategories}
                        selectedCountry={selectedCountry}
                    />
                </section>}
                <section className="flex flex-row gap-4">
                    {/*                    <div className="">
                        <PersonalizeByAnima/>
                    </div>*/}
                    <div className="flex-1">
                        <FrameByAnima
                            search={search}
                            selectedCategories={selectedCategories}
                            selectedCountry={selectedCountry}
                            hasConnection={false}
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
