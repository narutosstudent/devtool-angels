/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import Fuse from "fuse.js";
import Head from "next/head";
import { useMemo, useState } from "react";
import Header from "../components/Header";
import CheckIcon from "../components/Icons/CheckIcon";
import InvestorTable from "../components/InvestorTable";
import SearchBar from "../components/SearchBar";
import Stats from "../components/Stats";
import prisma from "../utils/prisma";
import {
  checkSizes,
  classNames,
  compare,
  getCheckSizeForId,
  searchOptions,
} from "../utils/utils";

export default function Dashboard({ data }: any) {
  const allAngels = JSON.parse(data);
  const [selectedCheckSize, setSelectedCheckSize] = useState("7");
  const [search, setSearch] = useState("");

  const ALL_ANGELS = allAngels
    .filter((angel: any) => !angel.hidden)
    .sort(compare)
    .filter((person: any) => {
      return selectedCheckSize === "7"
        ? true
        : person.checksize_id.toString() === selectedCheckSize;
    });

  // Fuzzy search with highlighting
  const fuse = new Fuse(ALL_ANGELS, searchOptions);
  const angels = useMemo(() => {
    if (search.length > 0) {
      return fuse.search(search).map((match) => match.item);
    }
    return ALL_ANGELS;
  }, [search, ALL_ANGELS]);

  // Get stats
  const companies = [...new Set(angels.map((angel: any) => angel.company))];
  const allChecksizes = angels
    .filter((angel: any) => angel.checksize_id)
    .map((angel: any) => getCheckSizeForId(angel.checksize_id));
  const averageCheck =
    allChecksizes.reduce((a: number, b: number) => a + b, 0) /
    allChecksizes.length;

  return (
    <div className="min-h-screen bg-gray-100 pb-10 px-6 lg:px-8">
      <Head>
        <title>Devtool Angels</title>
        <meta
          name="description"
          content="A list of angel investors that invest in developer tools."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-auto max-w-6xl pt-8 md:pt-20">
        <Header />
        <Stats
          angelsLength={angels.length}
          averageCheck={averageCheck}
          companiesLength={companies.length}
        />
        <div className="sm:flex flex-col md:flex-row justify-between mt-4">
          <span className="isolate mt-5 inline-flex rounded-md shadow-sm w-fit">
            {checkSizes.map((checkSize) => (
              <button
                key={checkSize.id}
                type="button"
                className={classNames(
                  selectedCheckSize === checkSize.id
                    ? "bg-gray-200"
                    : "bg-white hover:bg-gray-50",
                  "relative inline-flex items-center first-of-type:rounded-l-md last-of-type:rounded-r-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 focus:z-10 focus:outline-none focus:ring-gray-500 -ml-px first-of-type:-ml-0"
                )}
                onClick={() => setSelectedCheckSize(checkSize.id)}
              >
                {checkSize.label}
              </button>
            ))}
          </span>
          <SearchBar search={search} setSearch={setSearch} />
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle px-6 lg:px-8">
              <div className="overflow-hidden md:shadow md:ring-1 md:ring-black md:ring-opacity-5 rounded-lg">
                <InvestorTable angels={angels} search={search} />
              </div>
              <div className="text-center mt-10">
                <CheckIcon className="inline mr-1" />
                means the angel investor has confirmed their information is
                accurate and up to date.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const data = await prisma.investor.findMany({});

  return {
    props: {
      data: JSON.stringify(data),
    },
  };
}
