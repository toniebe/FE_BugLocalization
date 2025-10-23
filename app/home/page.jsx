import EasyfixBugGraph from "@/components/EasyFixBugGraph";
import React from "react";


const sample = {
  query: "app crash when open",
  bugs: [
    { id: 1931228, summary: "Include app version when storing a crash", assigned_to: "mtighe@mozilla.com", status: "RESOLVED", resolution: "FIXED", topic: null, topic_label: "UI: Toolbar / PDF / Android", topic_score: 0.6009 },
    { id: 1965490, summary: "New messaging ACTION to open app", assigned_to: "anpopa@mozilla.com", status: "NEW", resolution: null, topic: null, topic_label: "Search / Telemetry / History", topic_score: 0.6263 },
    { id: 1912002, summary: "Auto-open PiP on app switch", assigned_to: "danieleferla1@gmail.com", status: "ASSIGNED", resolution: null, topic: null, topic_label: "Search / Telemetry / History", topic_score: 0.85 },
    { id: 1979967, summary: "Accessibility annotation for disabled 'Open in app' button", assigned_to: "azinovyev@mozilla.com", status: "RESOLVED", resolution: "FIXED", topic: null, topic_label: "Search / Telemetry / History", topic_score: 0.6555 },
    { id: 1899329, summary: "[Menu Redesign] Implement \"Open in app\" menu functionality", assigned_to: "smathiyarasan@mozilla.com", status: "RESOLVED", resolution: "FIXED", topic: null, topic_label: "Search / Telemetry / History", topic_score: 0.8875 },
    { id: 1929028, summary: "website loads in background while ask to open in app prompt is open", assigned_to: "royang@mozilla.com", status: "RESOLVED", resolution: "FIXED", topic: null, topic_label: "Search / Telemetry / History", topic_score: 0.7812 },
    { id: 1930355, summary: "Open in app also opens website from a search", assigned_to: "tthibaud@mozilla.com", status: "RESOLVED", resolution: "FIXED", topic: null, topic_label: "Search / Telemetry / History", topic_score: 0.8714 },
    { id: 1936952, summary: "[Headless] nsColorPicker::Open crash under automation", assigned_to: "hskupin@gmail.com", status: "RESOLVED", resolution: "FIXED", topic: null, topic_label: "Search / Telemetry / History", topic_score: 0.275 },
    { id: 1992083, summary: "The open in app prompt buttons text is barely visible", assigned_to: "mcarare@mozilla.com", status: "VERIFIED", resolution: "FIXED", topic: null, topic_label: "Search / Telemetry / History", topic_score: 0.5549 },
    { id: 1979924, summary: "Crash when opening \"Report Broken Site\" screen while app is in Russian (RU) locale", assigned_to: "apindiprolu@mozilla.com", status: "VERIFIED", resolution: "FIXED", topic: null, topic_label: "Search / Telemetry / History", topic_score: 0.677 },
  ],
  developers: [
    { developer: "emilio@crisal.io", freq: 1554, score: 7981.103328227997 },
    { developer: "dao+bmo@mozilla.com", freq: 1147, score: 5858.826421260834 },
    { developer: "wptsync@mozilla.bugs", freq: 1177, score: 5710.8364906311035 },
    { developer: "twisniewski@mozilla.com", freq: 914, score: 4667.319995880127 },
    { developer: "petru@mozilla.com", freq: 770, score: 3938.82492351532 },
    { developer: "nchevobbe@mozilla.com", freq: 430, score: 2216.0865864753723 },
    { developer: "nsharpley@mozilla.com", freq: 430, score: 2209.679582118988 },
    { developer: "giorga@mozilla.com", freq: 426, score: 2182.430679798126 },
    { developer: "royang@mozilla.com", freq: 419, score: 2153.2524094581604 }, // <-- akan nyambung ke bug 1929028
    { developer: "rmalicdem@mozilla.com", freq: 351, score: 1798.0578722953796 },
  ],
};

export default function Page() {
  return (
    <main className="w-full h-screen bg-gray-100">
      {/* Header */}
      <div className="w-full border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-bold text-[#0D5DB8]">EASYFIX</div>
          <div className="w-8 h-8 rounded-full bg-gray-300" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-12 gap-4">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Search bug</h3>
          <label className="text-sm text-gray-500">Input your query</label>
          <input
            defaultValue={sample.query}
            className="mt-2 w-full border rounded px-3 py-2 outline-none focus:ring focus:ring-blue-200"
            placeholder="e.g. app crash when open"
          />
          <div className="flex items-center gap-2 mt-3">
            <button className="text-sm text-gray-500 hover:underline">Clear</button>
            <button className="ml-auto bg-[#0D5DB8] text-white text-sm px-4 py-2 rounded">Search</button>
          </div>

          <div className="mt-6 text-sm">
            <a className="text-[#0D5DB8] hover:underline" href="#">Graph Bug</a>
            <span className="mx-2 text-gray-400">/</span>
            <a className="text-gray-500 hover:underline" href="#">List Bug</a>
          </div>
        </aside>

        {/* Canvas graph */}
        <section className="col-span-12 md:col-span-9">
          <EasyfixBugGraph data={sample} />
        </section>
      </div>
    </main>
  );
}
