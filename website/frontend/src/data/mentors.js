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
    image: "https://xsgames.co/randomusers/assets/avatars/female/16.jpg",
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
    image: "https://xsgames.co/randomusers/assets/avatars/male/33.jpg",
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
    image: "https://xsgames.co/randomusers/assets/avatars/female/41.jpg",
  },
];

export const MENTOR_BY_ID = Object.fromEntries(
  MENTORS.map((mentor) => [mentor.id, mentor]),
);
