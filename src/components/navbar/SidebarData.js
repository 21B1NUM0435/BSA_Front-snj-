import React from "react";
import * as IoIcons from "react-icons/io";

export const SidebarData = {
  department: [
    {
      title: "Оюутны жагсаалт",
      path: "/studentlist",
      icon: <IoIcons.IoIosPaper />,
      cName: "nav-text",
    },
    {
      title: "Маягт тохиргоо",
      path: "/deformset",
      icon: <IoIcons.IoIosPaper />,
      cName: "nav-text",
    },
  ],
  supervisor: [
    {
      title: "Дэвшүүлсэн сэдэв",
      path: "/proposedtopics",
      icon: <IoIcons.IoIosPaper />,
      cName: "nav-text",
    },
    {
      title: "Хянасан сэдэв",
      path: "/approvedtopics",
      icon: <IoIcons.IoIosPaper />,
      cName: "nav-text",
    },
  ],
  student: [
    {
      title: "Сэдвийн жагсаалт",
      path: "/topicliststud",
      icon: <IoIcons.IoIosPaper />,
      cName: "nav-text",
    },
    {
      title: "Сэдэв дэвшүүлэх",
      path: "/proposetopicstud",
      icon: <IoIcons.IoIosPaper />,
      cName: "nav-text",
    },
    {
      title: "Сонгосон сэдэв",
      path: "/confirmedtopic",
      icon: <IoIcons.IoIosPaper />,
      cName: "nav-text",
    },
  ],
  teacher: [
    {
      title: "Сэдвийн жагсаалт",
      path: "/topiclist",
      icon: <IoIcons.IoIosPaper />,
      cName: "nav-text",
    },
    {
      title: "Сэдэв дэвшүүлэх",
      path: "/proposetopics",
      icon: <IoIcons.IoIosPaper />,
      cName: "nav-text",
    },
    {
      title: "Сонгогдсон сэдэв",
      path: "/confirmedtopics",
      icon: <IoIcons.IoIosPaper />,
      cName: "nav-text",
    },
  ],
};
