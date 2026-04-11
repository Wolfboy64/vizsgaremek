export const MENTORS = [
  {
    id: "mentor-kiss-anna",
    name: "Kiss Anna",
    title: "Cloud infrastruktura mentor",
    expertise: [
      "Linux szerver üzemeltetés",
      "Terraform es IaC alapok",
      "AWS / Azure induló projektek",
    ],
    image: "https://xsgames.co/randomusers/assets/avatars/female/16.jpg",
  },
  {
    id: "mentor-toth-david",
    name: "Tóth Dávid",
    title: "DevOps és automatizálás mentor",
    expertise: [
      "CI/CD pipeline építés",
      "Docker es konténeres deploy",
      "Monitoring es hibatűrés",
    ],
    image: "https://xsgames.co/randomusers/assets/avatars/male/33.jpg",
  },
  {
    id: "mentor-varga-lili",
    name: "Varga Lili",
    title: "Backend es adatbázis mentor",
    expertise: [
      "Node.js backend architektúra",
      "SQL teljesítmény-optimalizálás",
      "API tervezés és biztonság",
    ],
    image: "https://xsgames.co/randomusers/assets/avatars/female/41.jpg",
  },
];

export const MENTOR_BY_ID = Object.fromEntries(
  MENTORS.map((mentor) => [mentor.id, mentor]),
);
