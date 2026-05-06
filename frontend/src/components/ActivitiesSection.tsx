import { ActivityCard } from "./ActivityCard";

const activities = [
  { title: "Desert Tours", description: "Dunes, camps, sunsets, and stargazing.", icon: "🐪" },
  { title: "Beach Activities", description: "Coastal escapes, surf, and ocean cafés.", icon: "🌊" },
  { title: "Mountain Hiking", description: "Atlas trails, valleys, and viewpoints.", icon: "⛰️" },
  { title: "Cultural Experiences", description: "Medinas, souks, history, and food.", icon: "🕌" },
];

export function ActivitiesSection() {
  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {activities.map((a) => (
        <ActivityCard key={a.title} title={a.title} description={a.description} icon={a.icon} />
      ))}
    </section>
  );
}
