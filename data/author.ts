export type AuthorPaper = {
  title: string;
  venue: string;
  href?: string;
};

export type AuthorEducation = {
  school: string;
  program: string;
  dates: string;
  thesis: string;
};

/** Public profile for the site author. Facts follow his resume; paper links are publisher or DOI pages. */
export const author = {
  name: "刘永武",
  nameEn: "Will Liu",
  nameRoman: "Liu Yongwu",
  role: "站点作者",
  location: "深圳",
  email: "yongwu.liu@connect.polyu.hk",
  orcid: "https://orcid.org/0000-0002-4881-2855",
  orcidLabel: "0000-0002-4881-2855",
  bio: "刘永武研究强化学习、大语言模型，以及自动驾驶汽车的调度。计算机本硕，双学位博士，现为 AI纵横 的站点作者。",
  focus: [
    {
      title: "强化学习与组合优化",
      body: "用强化学习处理大规模组合优化，包括 MDP / SMDP 建模，以及资源分配、路径规划一类高维、动态决策的训练与优化。",
    },
    {
      title: "LLM-powered RL",
      body: "关注以大语言模型设计奖励的范式，以及后训练阶段的 RLHF，和 PPO、DPO、GRPO 等对齐算法。",
    },
    {
      title: "自动驾驶调度",
      body: "物流、应急和自动驾驶汽车调度中的车辆路径、选址与网络优化。异质车队、最后一公里、动态拼车是主要场景。相关研究在国家自然科学基金面上项目 72174042 与 71974043 支持下开展。",
    },
  ],
  papers: [
    {
      title:
        "Learning-based Heterogeneous Autonomous Vehicles Scheduling for On-demand Last-mile Transportation",
      venue: "IEEE Transactions on Automation Science and Engineering，2025。已发表，Q1，IF=6.4。一作",
      href: "https://doi.org/10.1109/TASE.2025.3611676",
    },
    {
      title:
        "A Two-stage Dispatching Approach for One-to-many Ride-sharing with Sliding-time Windows",
      venue: "Neural Computing and Applications，2024。已发表，Q2，IF=4.8。一作",
      href: "https://doi.org/10.1007/s00521-024-09631-z",
    },
    {
      title: "动态车辆共乘问题的双模式协作匹配算法",
      venue: "计算机研究与发展，2022。EI。通讯作者",
      href: "https://doi.org/10.7544/issn1000-1239.20210373",
    },
    {
      title:
        "An Exact Method for Vehicle Routing Problem with Backhaul Discounts in Urban Express Delivery Network",
      venue: "Cleaner Logistics and Supply Chain，2024。已发表，Q1，IF=6.9。合作",
      href: "https://doi.org/10.1016/j.clscn.2024.100157",
    },
    {
      title:
        "A matheuristic solution for efficient scheduling in dynamic truck–drone collaboration",
      venue: "Expert Systems with Applications，2025。已发表，Q1，IF=7.5。合作",
      href: "https://doi.org/10.1016/j.eswa.2024.126218",
    },
  ] satisfies AuthorPaper[],
  inReview: [
    {
      title:
        "LLM-powered Deep Reinforcement Learning for Heterogeneous Autonomous Vehicles Management in Last-mile Transportation",
      venue: "IEEE Transactions on Intelligent Transportation Systems。外审中。一作",
    },
    {
      title:
        "Joint Dispatching and Relocation of Heterogeneous Autonomous Vehicles via LLM-driven Reinforcement Learning",
      venue: "IEEE Transactions on Intelligent Transportation Systems。外审中。一作",
    },
  ] satisfies AuthorPaper[],
  education: [
    {
      school: "香港理工大学（QS 50）",
      program: "航空与民航工程，博士（双学位）",
      dates: "2023.09 – 2026.12（预计）",
      thesis: "Learning-based Autonomous Shuttle Services for Transportation Hubs",
    },
    {
      school: "哈尔滨工业大学（深圳）（C9）",
      program: "交通运输工程，博士",
      dates: "2022.03 – 2026.09",
      thesis: "基于强化学习的城市交通枢纽接驳无人车的动态调度方法研究",
    },
    {
      school: "辽宁工程技术大学",
      program: "软件工程，硕士（提前毕业）",
      dates: "2019.09 – 2021.12",
      thesis: "动态车辆共乘的双模式协作匹配算法研究",
    },
    {
      school: "辽宁工程技术大学",
      program: "网络工程，本科",
      dates: "2015.09 – 2019.07",
      thesis: "可扩展处理器中最大凸子图枚举算法研究",
    },
  ] satisfies AuthorEducation[],
  awards: [
    "香港理工大学博士全额奖学金 Postgraduate Scholarship，2023–2025",
    "哈尔滨工业大学（深圳）优秀学生，启智润心奖，2025",
    "哈尔滨工业大学（深圳）优秀学生，实学实干奖，2024",
    "哈尔滨工业大学（深圳）博士工科基金，2022–2026",
    "硕士研究生国家奖学金，2021",
    "顺丰科技 SF-X 智慧供应链高校精英挑战赛，全国一等奖，2023",
    "第十七届「华为杯」中国研究生数学建模竞赛，全国三等奖，2020",
    "第十届全国大学生数学竞赛，辽宁省二等奖，2018",
    "工业工程华人学者年会 Best Paper，2025",
    "数字智能物流与供应链国际会议 Best Paper 二等奖，2023",
  ],
  service: [
    "IEEE Transactions on Automation Science and Engineering，独立审稿人",
    "Journal of Production Research，独立审稿人",
    "Journal of Humanitarian Logistics & Supply Chain Management，青年编委，2025.10–2027.10",
  ],
  patentNote: "发明专利 6 项，其中 4 项已授权。",
  paperNote: "期刊与会议论文十余篇。下表为简历所列期刊论文，链到公开出版页。外审稿不附链接。",
};
