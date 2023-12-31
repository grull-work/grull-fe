/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SkillsRequiredCard from "../BrowseJobs/SkillsRequiredCard";
import BrowseByCard from "./BrowseByCard";
import { axiosGet } from "../../utils/services/axios";
import { Button } from "antd";

const BrowseJobs = ({ isFreelancer }) => {
  const [jobData, setJobData] = useState([]); // State variable to hold title
  const navigate = useNavigate();
  const [currentpage, setCurrentpage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollableJobs = useRef(null);
  const [daysfilter, setdaysfilter] = useState(30);
  const [locationfilter, setLocationfilter] = useState([]);
  const [categoryfilter, setCategoryfilter] = useState([]);
  useEffect(() => {
    handleBrowse();
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const scrollableDiv = scrollableJobs.current;
      const isAtBottom = Math.abs(scrollableDiv.scrollHeight - scrollableDiv.scrollTop - scrollableDiv.clientHeight) < 1;
      if (isAtBottom && !loading && hasMore) {
        loadMore();
      }
    };
    const scrollableDiv = scrollableJobs.current;
    if (scrollableDiv) {
      scrollableDiv.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener("scroll", handleScroll);
      }
    };
  }, [hasMore, loading]);
  const handleBrowse = async type => {
    const category = categoryfilter.map(item => items1[item]).join(",");
    const location = locationfilter.map(item => items2[item]).join(",");
    try {
      setLoading(true);
      const apiUrl = "/api/v0/jobs";
      const params = {
        page: currentpage,
        per_page: 8,
        category: category,
        location: location,
      };
      if (type == "filter") {
        params.page = 1;
      }
      const response = await axiosGet(apiUrl, params);
      if (!response.status) {
        throw new Error(`API error! Message: ${response.message}`);
      }
      const responseData = response;
      if (type == "filter") {
        setJobData([...responseData.results]);
        setCurrentpage(2);
        setHasMore(responseData.results.length >= 8);
      } else {
        setJobData(prevJobData => [...prevJobData, ...responseData.results]);
        setCurrentpage(currentpage + 1);
        setHasMore(responseData.results.length >= 8);
      }
      // Pass jobData as state to the next route using navigate
      // navigate(browseJobsRoute, {
      //   state: {
      //     jobData: responseData.results, // Pass jobData as state
      //   },
      // });
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error occurred:", error);
      setLoading(false);
      return false;
    }
  };
  const loadMore = () => {
    if (hasMore && !loading) {
      handleBrowse();
    }
  };
  const items1 = {
    "Graphic Designer": "GRAPHIC_DESIGNER",
    "Illustrator": "ILLUSTRATOR",
    "Programmer": "PROGRAMMER",
    "Video Editor": "VIDEO_EDITOR",
    "3D Artist": "THREE_D_ARTIST",
    "Product Designer": "PRODUCT_DESIGNER",
  };

  const items2 = {
    India: "INDIA",
    USA: "USA",
    Canada: "CANADA",
    England: "ENGLAND",
    China: "CHINA",
    Russia: "RUSSIA",
  };

  return (
    <div className="browse-jobs-container mt-10 sm:mt-0">
      <div className="2xl:h-[913px] overflow-y-hidden">
        <div className="flex flex-wrap justify-between items-center space-y-3">
          {window.innerWidth <= 640 ? (
            <div className="flex flex-col bg-[#B37EE2] sm:p-12  p-6 sm:rounded-tl-3xl sm:rounded-bl-3xl  mx-auto">
              <BrowseByCard topic="CATEGORY" items={items1} />
              <BrowseByCard topic="LOCATION" items={items2} />
            </div>
          ) : null}
          <div className="flex flex-col sm:pt-10 lg:pt-0 p-4 w-3/4 items-center px-6">
            <div className="flex flex-wrap  sm:flex-row flex-col justify-between sm:justify-between w-3/4">
              <p className="flex sm:text-4xl text-2xl text-white font-bold pl-0">POSTED JOBS</p>
              <div className="flex flex-col items-center">
                <p className="text-white sm:text-2xl font-semibold">Posted in the last &#x2191; 30 &#x2193; days</p>
              </div>
            </div>
            <div className="md:max-h-2/4 lg:max-h-3/4 overflow-y-scroll scrollbar-hide " ref={scrollableJobs}>
              {jobData && jobData.map((job, index) => <SkillsRequiredCard isFreelancer={true} jobData={job} onClick={() => navigate("/browseJobsInDetails")} />)}
            </div>
          </div>
          {window.innerWidth > 640 ? (
            <div className="flex flex-col bg-[#B37EE2] sm:p-12 rounded-tl-3xl rounded-bl-3xl w-1/4">
              <BrowseByCard topic="CATEGORY" items={items1} setFilter={setCategoryfilter} />
              <BrowseByCard topic="LOCATION" items={items2} setFilter={setLocationfilter} />
              <Button type="primary" style={{ background: "black" }} onClick={() => handleBrowse("filter")}>
                Apply
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BrowseJobs;
