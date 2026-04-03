import Image from "next/image";
import EmailLink from "@/components/EmailLink";

export default function Footer() {
  return (
    <footer className="bg-ch-midnite p-8 text-ch-lite">
      <div className="flex flex-col md:flex-row w-full justify-between gap-7">
        <div className="flex-1 flex justify-between py-4 border-t-[1px] border-ch-lite">
          <h2 className="flex-1 md:flex-initial uppercase font-bold tracking-tighter">
            About
          </h2>
          <div className="flex-1 md:flex-initial flex flex-col gap-3 mr-4 tracking-tight">
            <a href="/mission">Mission</a>
            <a href="/history">History</a>
            <a href="/locations">Locations</a>
            <a href="/team">Team</a>
            <a href="/partners">Partners</a>
          </div>
        </div>
        <div className="flex-1 flex justify-between py-4 border-t-[1px] border-ch-lite">
          <h2 className="flex-1 md:flex-initial uppercase font-bold tracking-tighter">
            Visit
          </h2>
          <div className="flex-1 md:flex-initial flex flex-col gap-6 mr-4 tracking-tight">
            <div className="flex flex-col gap-4">
              <p>
                47 Great Jones Street
                <br />
                New York, NY
              </p>
            </div>
            <EmailLink email="info@culturehub.org" />
            <div className="flex flex-col gap-4">
              <p>
                1933 South Broadway
                <br />
                Los Angeles, CA
              </p>
              <EmailLink email="lainfo@culturehub.org" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col py-4 gap-4 border-t-[1px] border-ch-lite">
          <div className="flex flex-row justify-between">
            <h2 className="flex-1 md:flex-initial uppercase font-bold tracking-tighter">
              Connect
            </h2>
            <div className="flex-1 md:flex-initial flex flex-col gap-2 mr-4">
              <a
                href="https://www.instagram.com/culturehub_org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex flex-row gap-7">
                  <Image
                    width="25"
                    height="25"
                    src="/ig_logo.svg"
                    alt="Instagram logo"
                  />
                  Instagram
                </div>
              </a>
              <a
                href="https://www.youtube.com/c/culturehub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex flex-row gap-7">
                  <Image
                    width="25"
                    height="25"
                    src="/youtube_logo.svg"
                    alt="YouTube logo"
                  />
                  YouTube
                </div>
              </a>
              <a href="/donate">
                <div className="flex flex-row gap-7">
                  <Image
                    width="25"
                    height="25"
                    src="/donate_icon.svg"
                    alt="Donate icon"
                  />
                  Donate
                </div>
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="uppercase font-bold tracking-tighter">Newsletter</h2>
            <div className="flex flex-row gap-4">
              <input
                id="emailInput"
                placeholder="Your Email"
                className="flex-1 px-2 rounded-lg border border-ch-lite placeholder-ch-lite"
              />
              <button className="w-14 h-8 flex justify-center align-center w-14 bg-ch-lite rounded-lg">
                <Image
                  width="11"
                  height="20"
                  src="/submit_icon.svg"
                  alt="Submit icon"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-12 mt-[27px]">
        <Image
          width="466"
          height="68"
          src="/ch_logo_large_lite.svg"
          alt="CultureHub logo"
        />
        <p className="w-80 md:self-end">
          A global arts and technology community founded by SeoulArts & La MaMa
        </p>
      </div>
    </footer>
  );
}
