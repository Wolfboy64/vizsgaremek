const buildAvatar = (name, color) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='160' height='120' viewBox='0 0 160 120'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0%' stop-color='${color}' />
          <stop offset='100%' stop-color='#0f1a3e' />
        </linearGradient>
      </defs>
      <rect width='160' height='120' fill='url(#g)' />
      <circle cx='80' cy='48' r='22' fill='rgba(255,255,255,0.2)' />
      <rect x='42' y='78' width='76' height='24' rx='12' fill='rgba(255,255,255,0.2)' />
      <text x='80' y='114' text-anchor='middle' fill='white' font-size='20' font-family='Arial, sans-serif' font-weight='700'>${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const MENTORS = [
  {
    id: "mentor-kiss-anna",
    name: "Kiss Anna",
    title: "Cloud infrastruktura mentor",
    expertise: [
      "Linux szerver uzemeltetes",
      "Terraform es IaC alapok",
      "AWS / Azure indulo projektek",
    ],
    image: buildAvatar("Kiss Anna", "#0ea5e9"),
  },
  {
    id: "mentor-toth-david",
    name: "Toth David",
    title: "DevOps es automatizalas mentor",
    expertise: [
      "CI/CD pipeline epites",
      "Docker es konteneres deploy",
      "Monitoring es hibatures",
    ],
    image: buildAvatar("Toth David", "#14b8a6"),
  },
  {
    id: "mentor-varga-lili",
    name: "Varga Lili",
    title: "Backend es adatbazis mentor",
    expertise: [
      "Node.js backend architektura",
      "SQL teljesitmeny-optimalizalas",
      "API tervezes es biztonsag",
    ],
    image: buildAvatar("Varga Lili", "#f97316"),
  },
];

export const MENTOR_BY_ID = Object.fromEntries(
  MENTORS.map((mentor) => [mentor.id, mentor]),
);
