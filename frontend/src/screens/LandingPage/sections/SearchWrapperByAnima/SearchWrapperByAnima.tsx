import {SearchIcon} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "../../../../components/ui/select";
import {Input} from "../../../../components/ui/input";
import {useEffect, useRef, useState} from "react";
import {COUNTRIES} from "../../../../lib/utils/countries.ts";

const countries = [...["All Countries"], ...COUNTRIES.map(C => C.title)];

export const SearchWrapperByAnima
    = ({
           setSearch,
           setSelectedCountry,
       }: {
    setSearch: (value: string) => void;
    setSelectedCountry: (value: string) => void;
}): JSX.Element => {

    const [searchInput, setSearchInput] = useState("");
    const [country, setCountry] = useState("All Countries");
    const debounceTimeout = useRef<number | null>(null);

    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = window.setTimeout(() => {
            setSearch(searchInput);
        }, 1000);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [searchInput, setSearch]);

    const handleSearchTextChange = (value: string) => {
        setSearchInput(value);
    };

    const handleCountryChange = (value: string) => {
        setCountry(value);
        setSelectedCountry(value);
    };

    return (
        <header
            className="flex flex-col items-center justify-center gap-2.5 py-8 border-b mx-0 md:mx-6 border-[#d7d7db]">
            <div
                className="flex w-full max-w-[700px] items-center gap-4 pl-6 pr-3 py-4 bg-white rounded-[100px] border border-solid border-zinc-200 shadow-[0px_5px_20px_#0000000d]">
                {/* Search Icon and Text Input */}
                <div className="flex items-center gap-4 flex-1">
                    <SearchIcon className="w-6 h-6 text-[#141b34] flex-shrink-0"/>
                    <Input
                        type="text"
                        placeholder="Search for professionals, companies, or services..."
                        onChange={(e) => handleSearchTextChange(e.target.value)}
                        className="border-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={searchInput}
                    />
                </div>

                {/* Country Filter */}
                <div className="flex-shrink-0">
                    <Select value={country} onValueChange={handleCountryChange}>
                        <SelectTrigger
                            className="text-[#141B34] text-sm inline-flex items-center justify-center gap-2 px-5 py-4 rounded-full border border-solid border-zinc-200 hover:bg-gray-50 min-w-fit">
                            <SelectValue placeholder="Select a country"/>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                    {country}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </header>
    );
};
