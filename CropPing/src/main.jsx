import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const STORAGE_KEY = "cropping-demo-v2";

const cropProfiles = {
  Wheat: [
    ["Sowing", 0, "Prepare seed and complete sowing."],
    ["Germination", 7, "Monitor emergence and early crop health."],
    ["Vegetative Stage", 20, "Monitor crop growth and field conditions."],
    ["Fertiliser Application", 25, "Arrange the required fertiliser before the application window."],
    ["Crop Protection", 42, "Review crop-protection requirements for the next stage."],
    ["Irrigation Check", 50, "Check irrigation requirements for the current crop stage."],
    ["Harvest Preparation", 105, "Prepare for harvesting and post-harvest handling."]
  ],
  Rice: [
    ["Sowing", 0, "Prepare seed and complete sowing."],
    ["Early Growth", 14, "Monitor emergence and early crop health."],
    ["Vegetative Stage", 30, "Monitor crop growth and field conditions."],
    ["Nutrient Application", 35, "Arrange the required nutrient input before the application window."],
    ["Crop Protection", 55, "Review crop-protection requirements."],
    ["Irrigation Check", 65, "Check water requirements for the current crop stage."],
    ["Harvest Preparation", 115, "Prepare for harvesting."]
  ],
  Cotton: [
    ["Sowing", 0, "Prepare seed and complete sowing."],
    ["Germination", 10, "Monitor emergence and plant stand."],
    ["Vegetative Stage", 35, "Monitor crop growth and field conditions."],
    ["Nutrient Application", 45, "Arrange the required nutrient input."],
    ["Crop Protection", 70, "Review crop-protection requirements."],
    ["Irrigation Check", 85, "Check irrigation requirements."],
    ["Harvest Preparation", 155, "Prepare for harvesting."]
  ],
  Vegetables: [
    ["Sowing / Transplanting", 0, "Complete sowing or transplanting."],
    ["Establishment", 10, "Monitor plant establishment."],
    ["Vegetative Stage", 25, "Monitor crop growth."],
    ["Nutrient Application", 30, "Arrange the required nutrient input."],
    ["Crop Protection", 45, "Review crop-protection requirements."],
    ["Harvest Preparation", 70, "Prepare for harvesting."]
  ],
  Other: [
    ["Sowing / Planting", 0, "Complete the initial planting activity."],
    ["Establishment", 14, "Monitor establishment and crop health."],
    ["Growth Stage", 30, "Monitor crop growth and field conditions."],
    ["Input Check", 45, "Review upcoming crop-input requirements."],
    ["Crop Protection", 60, "Review crop-protection requirements."],
    ["Harvest Preparation", 90, "Prepare for harvesting."]
  ]
};

const emptyState = {
  farmer: {
    name: "",
    mobile: "",
    location: "",
    crop: "",
    sowingDate: "",
    language: "English",
    channel: "WhatsApp",
    consent: false
  },
  reminders: [],
  feedback: [],
  settings: { monthlyPilotCost: "" }
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...emptyState, ...JSON.parse(saved) } : emptyState;
  } catch {
    return emptyState;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function dateAt(dateString, offset) {
  const d = new Date(`${dateString}T00:00:00`);
  d.setDate(d.getDate() + offset);
  return d;
}

function formatDate(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function cropCalendar(crop, sowingDate) {
  if (!crop || !sowingDate || !cropProfiles[crop]) return [];
  const stages = cropProfiles[crop];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return stages.map(([title, offset, action], index) => {
    const date = dateAt(sowingDate, offset);
    const next = stages[index + 1] ? dateAt(sowingDate, stages[index + 1][1]) : null;
    const status = date < today ? "Completed" : index === 0 || (date <= today && (!next || today < next)) ? "Current" : "Upcoming";
    return { id: `${title}-${offset}`, title, offset, date, next, action, status };
  });
}

function App() {
  const [state, setState] = useState(loadState);
  const [screen, setScreen] = useState("overview");
  const [notice, setNotice] = useState("");

  useEffect(() => saveState(state), [state]);

  const calendar = useMemo(
    () => cropCalendar(state.farmer.crop, state.farmer.sowingDate),
    [state.farmer.crop, state.farmer.sowingDate]
  );

  const upcoming = calendar.find(x => x.status === "Current" || x.status === "Upcoming");

  function updateFarmer(patch) {
    setState(s => ({ ...s, farmer: { ...s.farmer, ...patch } }));
  }

  function registerFarmer() {
    const f = state.farmer;
    if (!f.name.trim() || !f.mobile.trim() || !f.crop || !f.sowingDate || !f.consent) {
      setNotice("Complete the required fields and confirm consent before continuing.");
      return;
    }
    setNotice("Farmer profile saved locally.");
    setScreen("overview");
  }

  function sendReminder() {
    if (!upcoming) {
      setNotice("Add a crop and sowing date first.");
      return;
    }
    const reminder = {
      id: crypto.randomUUID(),
      stage: upcoming.title,
      scheduledFor: formatDate(upcoming.date),
      channel: state.farmer.channel,
      status: "Delivered",
      createdAt: new Date().toISOString()
    };
    setState(s => ({ ...s, reminders: [reminder, ...s.reminders] }));
    setNotice("Reminder simulated successfully. No real message was sent.");
  }

  function addFeedback(value) {
    setState(s => ({
      ...s,
      feedback: [{ id: crypto.randomUUID(), value, createdAt: new Date().toISOString() }, ...s.feedback]
    }));
    setNotice("Feedback recorded.");
  }

  const hasFarmer = Boolean(state.farmer.name && state.farmer.crop && state.farmer.sowingDate);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand" onClick={() => setScreen("overview")}>
          <div className="mark">CP</div>
          <div>
            <strong>CropPing</strong>
            <span>Farm input reminder service</span>
          </div>
        </div>
        <div className="topActions">
          <span className="environment"><span className="pulse" /> Prototype</span>
          <button className="reset" onClick={() => { setState(emptyState); setNotice("Local demo data cleared."); setScreen("overview"); }}>
            Reset demo
          </button>
        </div>
      </header>

      <div className="shell">
        <aside className="sidebar">
          <div className="workspace">
            <span>WORKSPACE</span>
            <b>CropPing Pilot</b>
          </div>
          <nav>
            <NavButton active={screen === "overview"} onClick={() => setScreen("overview")} icon="⌂" label="Overview" />
            <NavButton active={screen === "farmer"} onClick={() => setScreen("farmer")} icon="◉" label="Farmer profile" />
            <NavButton active={screen === "calendar"} onClick={() => setScreen("calendar")} icon="□" label="Crop calendar" />
            <NavButton active={screen === "reminder"} onClick={() => setScreen("reminder")} icon="↗" label="Reminder" />
            <NavButton active={screen === "operations"} onClick={() => setScreen("operations")} icon="▦" label="Operations" />
          </nav>
          <div className="sidebarBottom">
            <div className="pilotMini">
              <span>PILOT ECONOMICS</span>
              <b>{state.settings.monthlyPilotCost ? `₹${Number(state.settings.monthlyPilotCost).toLocaleString("en-IN")}` : "—"}</b>
              <small>monthly operating cost</small>
            </div>
            <div className="privacy">Data is stored only in this browser for the prototype.</div>
          </div>
        </aside>

        <main>
          {notice && <div className="notice">{notice}<button onClick={() => setNotice("")}>×</button></div>}

          {screen === "overview" && (
            <Overview
              hasFarmer={hasFarmer}
              farmer={state.farmer}
              calendar={calendar}
              upcoming={upcoming}
              reminders={state.reminders}
              feedback={state.feedback}
              onGo={setScreen}
            />
          )}

          {screen === "farmer" && (
            <FarmerProfile
              farmer={state.farmer}
              updateFarmer={updateFarmer}
              register={registerFarmer}
            />
          )}

          {screen === "calendar" && (
            <CalendarPage farmer={state.farmer} calendar={calendar} onGo={setScreen} />
          )}

          {screen === "reminder" && (
            <ReminderPage
              farmer={state.farmer}
              upcoming={upcoming}
              reminders={state.reminders}
              feedback={state.feedback}
              onSend={sendReminder}
              onFeedback={addFeedback}
            />
          )}

          {screen === "operations" && (
            <Operations
              state={state}
              setState={setState}
              calendar={calendar}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button className={`navButton ${active ? "active" : ""}`} onClick={onClick}>
      <span className="navIcon">{icon}</span>
      <span>{label}</span>
      {active && <i />}
    </button>
  );
}

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="pageHeader">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function Overview({ hasFarmer, farmer, calendar, upcoming, reminders, feedback, onGo }) {
  const completed = calendar.filter(x => x.status === "Completed").length;
  const delivered = reminders.filter(x => x.status === "Delivered").length;
  const useful = feedback.filter(x => x.value === "Useful").length;
  const feedbackRate = feedback.length ? Math.round((useful / feedback.length) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="OVERVIEW"
        title={hasFarmer ? `Good to see you, ${farmer.name.split(" ")[0]}.` : "Build the reminder journey."}
        description={hasFarmer ? "Your farmer profile is connected to a crop calendar. The next action is ready to test." : "Start with one farmer profile, then turn crop timing into a useful, measurable reminder journey."}
        action={!hasFarmer && <button className="primary" onClick={() => onGo("farmer")}>Add farmer →</button>}
      />

      {!hasFarmer ? (
        <div className="emptyHero">
          <div className="emptyIcon">+</div>
          <div>
            <span className="eyebrow">FIRST STEP</span>
            <h2>No farmer profile yet</h2>
            <p>Enter a crop and sowing date to generate a stage-based calendar. The rest of the demo will populate automatically.</p>
            <button className="secondary" onClick={() => onGo("farmer")}>Create profile</button>
          </div>
        </div>
      ) : (
        <>
          <div className="metricGrid">
            <Metric label="Crop" value={farmer.crop} note={farmer.location || "Location not added"} />
            <Metric label="Current stage" value={calendar.find(x => x.status === "Current")?.title || "Before schedule"} note={`${completed} completed stages`} />
            <Metric label="Next action" value={upcoming?.title || "Complete"} note={upcoming ? formatDate(upcoming.date) : "No upcoming stage"} />
            <Metric label="Reminders delivered" value={delivered} note={feedback.length ? `${feedbackRate}% useful feedback` : "No feedback yet"} />
          </div>

          <div className="twoCol">
            <section className="card">
              <div className="cardHeader"><div><span className="eyebrow">NEXT ACTION</span><h2>{upcoming?.title || "Crop cycle complete"}</h2></div><span className="badge">{upcoming ? formatDate(upcoming.date) : "—"}</span></div>
              <p className="bodyText">{upcoming?.action || "Add another crop cycle to continue the demo."}</p>
              <div className="actionRow">
                <button className="primary" onClick={() => onGo("reminder")}>Open reminder</button>
                <button className="secondary" onClick={() => onGo("calendar")}>View calendar</button>
              </div>
            </section>

            <section className="card">
              <div className="cardHeader"><div><span className="eyebrow">PROFILE</span><h2>{farmer.name}</h2></div><span className="channel">{farmer.channel}</span></div>
              <div className="detailGrid">
                <Detail label="Mobile" value={farmer.mobile} />
                <Detail label="Location" value={farmer.location || "—"} />
                <Detail label="Language" value={farmer.language} />
                <Detail label="Sowing date" value={formatDate(new Date(`${farmer.sowingDate}T00:00:00`))} />
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
}

function Metric({ label, value, note }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}
function Detail({ label, value }) {
  return <div><span>{label}</span><b>{value}</b></div>;
}

function FarmerProfile({ farmer, updateFarmer, register }) {
  return (
    <>
      <PageHeader eyebrow="FARMER PROFILE" title="Set up the farmer" description="Nothing is pre-filled. Enter the information you want to use in the live demo." />
      <section className="card formCard">
        <div className="sectionIntro">
          <div><span className="eyebrow">REQUIRED INFORMATION</span><h2>Farmer and crop details</h2></div>
          <span className="required">* Required</span>
        </div>
        <div className="formGrid">
          <Field label="Farmer name *" value={farmer.name} onChange={v => updateFarmer({ name: v })} placeholder="e.g. Ramesh Patil" />
          <Field label="Mobile number *" value={farmer.mobile} onChange={v => updateFarmer({ mobile: v })} placeholder="+91 ..." />
          <Field label="Location" value={farmer.location} onChange={v => updateFarmer({ location: v })} placeholder="Village / district / state" />
          <SelectField label="Crop *" value={farmer.crop} onChange={v => updateFarmer({ crop: v })} options={Object.keys(cropProfiles)} placeholder="Select crop" />
          <Field label="Sowing date *" type="date" value={farmer.sowingDate} onChange={v => updateFarmer({ sowingDate: v })} />
          <SelectField label="Preferred language" value={farmer.language} onChange={v => updateFarmer({ language: v })} options={["English", "Hindi", "Marathi", "Gujarati", "Other"]} />
          <SelectField label="Preferred channel" value={farmer.channel} onChange={v => updateFarmer({ channel: v })} options={["WhatsApp", "SMS"]} />
        </div>

        <div className="consentBox">
          <label className="checkLabel">
            <input type="checkbox" checked={farmer.consent} onChange={e => updateFarmer({ consent: e.target.checked })} />
            <span>I have consent to send crop-related reminders to this farmer.</span>
          </label>
          <small>This prototype does not send real SMS or WhatsApp messages.</small>
        </div>

        <div className="formFooter">
          <span>Changes are saved in your browser.</span>
          <button className="primary" onClick={register}>Save farmer profile →</button>
        </div>
      </section>
    </>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return <label className="field"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} /></label>;
}
function SelectField({ label, value, onChange, options, placeholder }) {
  return <label className="field"><span>{label}</span><select value={value} onChange={e => onChange(e.target.value)}><option value="">{placeholder}</option>{options.map(x => <option key={x}>{x}</option>)}</select></label>;
}

function CalendarPage({ farmer, calendar, onGo }) {
  return (
    <>
      <PageHeader eyebrow="CROP CALENDAR" title={farmer.crop ? `${farmer.crop} crop calendar` : "Crop calendar"} description="The schedule is generated from the crop and sowing date in the farmer profile." action={!farmer.crop && <button className="primary" onClick={() => onGo("farmer")}>Set crop →</button>} />
      {!calendar.length ? (
        <div className="emptyHero"><div className="emptyIcon">□</div><div><h2>Calendar needs a crop and sowing date</h2><p>Complete the farmer profile and the stages will be generated automatically.</p></div></div>
      ) : (
        <section className="card calendarCard">
          {calendar.map((item, index) => (
            <div className={`calendarRow ${item.status.toLowerCase()}`} key={item.id}>
              <div className="dateCol">{formatDate(item.date)}</div>
              <div className="timelineDot"><i /></div>
              <div className="stageCol"><strong>{item.title}</strong><p>{item.action}</p></div>
              <div className={`status ${item.status.toLowerCase()}`}>{item.status}</div>
              {index === calendar.findIndex(x => x.status === "Current" || x.status === "Upcoming") && <button className="tiny" onClick={() => onGo("reminder")}>Test reminder</button>}
            </div>
          ))}
        </section>
      )}
    </>
  );
}

function ReminderPage({ farmer, upcoming, reminders, feedback, onSend, onFeedback }) {
  const latest = reminders[0];
  const sent = Boolean(latest);
  return (
    <>
      <PageHeader eyebrow="REMINDER SIMULATION" title="Turn timing into action" description="Preview the farmer-facing message and simulate delivery. The demo never contacts a real messaging provider." />
      {!farmer.name || !upcoming ? (
        <div className="emptyHero"><div className="emptyIcon">↗</div><div><h2>Nothing to send yet</h2><p>Complete the farmer profile with a crop and sowing date first.</p></div></div>
      ) : (
        <div className="reminderGrid">
          <div className="phoneFrame">
            <div className="phoneTop"><span>{farmer.channel}</span><span>Preview</span></div>
            <div className="phoneHeader"><div className="avatar">CP</div><div><b>CropPing</b><small>Farm advisory</small></div></div>
            <div className="chatBody">
              {sent ? (
                <div className="message">
                  <span className="messageTag">FARM INPUT REMINDER</span>
                  <p>Hello {farmer.name.split(" ")[0]},</p>
                  <p>Your <b>{farmer.crop}</b> crop is approaching the <b>{upcoming.title.toLowerCase()}</b> stage.</p>
                  <p>{upcoming.action}</p>
                  <div className="messageDate">{formatDate(upcoming.date)} · Delivered ✓✓</div>
                </div>
              ) : (
                <div className="messagePlaceholder">Your message preview will appear here after you simulate delivery.</div>
              )}
            </div>
          </div>

          <div className="reminderSide">
            <section className="card">
              <div className="cardHeader"><div><span className="eyebrow">DELIVERY LOGIC</span><h2>{upcoming.title}</h2></div><span className="badge">{formatDate(upcoming.date)}</span></div>
              <div className="logic"><Detail label="Farmer" value={farmer.name} /><Detail label="Crop" value={farmer.crop} /><Detail label="Channel" value={farmer.channel} /><Detail label="Language" value={farmer.language} /></div>
              <button className="primary wide" onClick={onSend}>{sent ? "Send another test reminder" : "Simulate delivery →"}</button>
              {sent && <div className="success">✓ Delivery simulated successfully — no external message was sent.</div>}
            </section>

            <section className="card">
              <div className="cardHeader"><div><span className="eyebrow">FEEDBACK LOOP</span><h2>Was this reminder useful?</h2></div></div>
              <div className="feedbackActions">
                <button className="feedback" onClick={() => onFeedback("Useful")}>Useful</button>
                <button className="feedback" onClick={() => onFeedback("Not relevant")}>Not relevant</button>
              </div>
              {feedback.length > 0 && <p className="mutedText">Latest response: <b>{feedback[0].value}</b></p>}
            </section>
          </div>
        </div>
      )}
    </>
  );
}

function Operations({ state, setState, calendar }) {
  const delivered = state.reminders.filter(x => x.status === "Delivered").length;
  const useful = state.feedback.filter(x => x.value === "Useful").length;
  const feedbackRate = state.feedback.length ? Math.round(useful / state.feedback.length * 100) : 0;
  const deliveryRate = state.reminders.length ? 100 : 0;

  return (
    <>
      <PageHeader eyebrow="OPERATIONS" title="Pilot control room" description="Operational metrics are calculated from the actions you perform in this prototype. Nothing is manually typed into the dashboard." />
      <div className="metricGrid four">
        <Metric label="Farmer profiles" value={state.farmer.name ? 1 : 0} note="Current browser workspace" />
        <Metric label="Reminders delivered" value={delivered} note={`${deliveryRate}% simulated delivery rate`} />
        <Metric label="Useful feedback" value={`${feedbackRate}%`} note={`${state.feedback.length} responses recorded`} />
        <Metric label="Upcoming stages" value={calendar.filter(x => x.status === "Upcoming").length} note="From current crop calendar" />
      </div>

      <div className="twoCol">
        <section className="card">
          <div className="cardHeader"><div><span className="eyebrow">PILOT ASSUMPTIONS</span><h2>Enter the economics</h2></div></div>
          <label className="field"><span>Monthly pilot messaging + coordination cost (₹)</span><input type="number" min="0" value={state.settings.monthlyPilotCost} placeholder="Enter amount" onChange={e => setState(s => ({ ...s, settings: { ...s.settings, monthlyPilotCost: e.target.value } }))} /></label>
          {state.settings.monthlyPilotCost && (
            <div className="costResult">
              <div><span>500-farmer pilot baseline</span><b>₹{Number(state.settings.monthlyPilotCost).toLocaleString("en-IN")} / month</b></div>
              <div><span>Cost per farmer / month</span><b>₹{Math.round(Number(state.settings.monthlyPilotCost) / 500).toLocaleString("en-IN")}</b></div>
            </div>
          )}
        </section>

        <section className="card">
          <div className="cardHeader"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>What just happened</h2></div></div>
          {state.reminders.length === 0 && state.feedback.length === 0 ? <p className="mutedText">Your actions will appear here as you run the demo.</p> : (
            <div className="activityList">
              {state.reminders.slice(0, 5).map(r => <div key={r.id}><i>✓</i><span><b>{r.stage}</b><small>{r.channel} · {r.scheduledFor}</small></span></div>)}
              {state.feedback.slice(0, 5).map(r => <div key={r.id}><i>•</i><span><b>Farmer feedback</b><small>{r.value}</small></span></div>)}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
