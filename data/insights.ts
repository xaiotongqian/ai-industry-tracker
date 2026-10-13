export type InsightPillar = "trend" | "industry" | "investing";

export type InsightBlock = {
  heading?: string;
  paragraphs: string[];
};

export type InsightLink = {
  href: string;
  label: string;
};

export type Insight = {
  slug: string;
  pillar: InsightPillar;
  title: string;
  lede: string;
  publishedOn: string;
  blocks: InsightBlock[];
  related: InsightLink[];
};

export const INSIGHT_BYLINE = "AI纵横 观点";

export const INSIGHT_NOTE = "编辑写定，不是实时生成。";

export const INVESTMENT_DISCLAIMER =
  "投资视角只提供框架性讨论和风险提示，由 AI纵横 编辑写定。内容不构成投资建议、证券推荐或收益承诺，也不对任何具体证券、基金或融资轮次作出买卖判断。市场有风险，请独立决策。";

export const pillars: {
  id: InsightPillar;
  label: string;
  lede: string;
}[] = [
  {
    id: "trend",
    label: "AI 发展态势",
    lede: "顺着站内已经分开的栏目来读：模型页上的分列、地图的六类、融资里写明的金额。",
  },
  {
    id: "industry",
    label: "行业影响",
    lede: "采纳发生在原来的流程里。出行、金融、制造和内容，问的是约束和责任，不是演示是否流畅。",
  },
  {
    id: "investing",
    label: "投资视角",
    lede: "用来对照融资页和产业地图的阅读框架。先看免责声明。",
  },
];

export const insights: Insight[] = [
  {
    slug: "three-columns",
    pillar: "trend",
    title: "读模型，先把列拆开",
    lede: "质量、编码、速度和价格回答的不是同一个问题。合成一个总分，采购时该看的差别就没了。",
    publishedOn: "2026-10-08",
    blocks: [
      {
        paragraphs: [
          "模型页把质量、编码、智能体、速度和输入价格分开列。质量、编码和智能体都是指数，看的任务不一样；速度看输出快慢，价格看输入贵不贵。这些列不适合折成一个名次再对外说领先。",
          "开源权重和闭源接口也不在同一条账单上。权重后面是自己的推理和运维；接口按 token 计，长上下文一旦被单独标价，结构就变了。页面上的价格列是输入价，输出价另写，单位仍是「美元 / 百万 token」。",
          "基准接口没有接上时，这些格子会标成示意。示意刻度用来预览版面，不能当成测量。先问手头的任务卡在哪一列：写代码看编码，多步任务看智能体，首响看速度，大批量看输入价格。",
        ],
      },
    ],
    related: [
      { href: "/models", label: "模型基准" },
      { href: "/insights/six-layers", label: "六类供给" },
    ],
  },
  {
    slug: "six-layers",
    pillar: "trend",
    title: "先归到六类供给，再谈谁赢了",
    lede: "地图上的格子比公司名稳定。同一周的头条，加厚的往往不是同一层。",
    publishedOn: "2026-10-05",
    blocks: [
      {
        paragraphs: [
          "产业地图分成六类：基础模型、基础设施、智能体、垂直应用、数据与评测、芯片与算力。这是阅读用的格子。实验室放出权重、一座园区在争 GPU、一套医院系统接进临床记录，不该写成同一种胜利。",
          "智能体和垂直应用最容易被叠在一起。智能体把模型接进可以交付的任务；垂直应用扎进行业里已有的流程。检索做成了对话，还不等于流程被接走。律所的计费、医院的信息系统、工厂的节拍，采纳都发生在原来的系统里。",
          "芯片与算力是另一条供给。推理和训练抢同一批 GPU，软件栈和芯片绑紧之后，模型页上的速度和价格会跟着动。这一层单独放开，容量新闻才不会被写成模型新闻。",
        ],
      },
    ],
    related: [
      { href: "/landscape", label: "产业地图" },
      { href: "/insights/three-columns", label: "模型的分列" },
      { href: "/insights/disclosed-rounds", label: "看融资怎么读" },
    ],
  },
  {
    slug: "dispatch-before-chat",
    pillar: "industry",
    title: "出行和物流里，模型先碰到调度",
    lede: "最后一公里、拼车和异质车队，决策是分配。约束来自时间窗、容量和真实订单。",
    publishedOn: "2026-09-28",
    blocks: [
      {
        paragraphs: [
          "出行和物流的采纳，通常从调度开始：哪辆车去接、订单和路径怎么匹配、枢纽在高峰和低谷怎么挪车。问题的形状是车辆路径、选址和网络，不是一段更长的上下文。",
          "异质车队把座位、载重和能耗放进同一次指派，服务模式也不只一种。拼车则常常把预约和实时拆开：预约看路径是否相近，实时看距离，两段合在一起才同时照顾匹配率和速度。机场和高铁的潮汐客流，还会把调度和车辆重定位绑在同一个决策里。",
          "语言模型进到这一层，比较稳的位置是奖励设计、车队构成或宏观引导，而不是替掉每一秒的车辆指派。规则和记忆用来隔开不可靠的输出，训练环和决策环最好解开。这是调度系统能放进真实订单的条件，也是本站作者的研究主题。论文在关于页。",
        ],
      },
    ],
    related: [
      { href: "/about", label: "关于 · 刘永武" },
      { href: "/landscape", label: "产业地图" },
      { href: "/insights/factory-and-media", label: "制造与内容" },
    ],
  },
  {
    slug: "audit-trail",
    pillar: "industry",
    title: "金融要留下可核对的步骤",
    lede: "对话窗口适合演示。预算通常卡在记录、权限和责任边界。",
    publishedOn: "2026-09-21",
    blocks: [
      {
        paragraphs: [
          "金融场景里，模型常常先被拿去试研究摘要、会议纪要和内部检索。碰到预算时，问题会换成：谁问的、引用了哪份材料、输出进了哪个系统、错了由谁承担。",
          "能把长任务拆开并留下记录，才接近机构已经有的合规习惯。没有记录的自动操作，试点很难走出沙箱。模型能力相近时，部署地和日志留在哪里，往往比多一个榜单分数更先被问到。",
          "本篇讨论的是流程和责任。个股、价格预测和「该不该买某一轮」都不在这里。融资新闻怎么读，见投资视角，并先看那里的免责声明。",
        ],
      },
    ],
    related: [
      { href: "/insights/disclosed-rounds", label: "投资视角与免责声明" },
      { href: "/landscape", label: "产业地图" },
    ],
  },
  {
    slug: "factory-and-media",
    pillar: "industry",
    title: "制造看节拍，内容看责任还在不在",
    lede: "两边的采纳都发生在原来的流程里。演示更流畅，本身还不是上线。",
    publishedOn: "2026-09-14",
    blocks: [
      {
        heading: "制造",
        paragraphs: [
          "产线在意节拍、异常和停机。视觉质检、排程、能耗，要能接进已有的系统，并说明误报由谁处理。和出行一样，决策是约束下的分配：机台、批次、人。一段更顺的介绍，不会因此被放进节拍。",
        ],
      },
      {
        heading: "内容",
        paragraphs: [
          "生成的边际成本下降之后，编辑、版权、分发和标识还在。影响先体现在成本曲线，然后是责任放在谁身上。生成演示不能写成媒体替代已经完成。",
        ],
      },
    ],
    related: [
      { href: "/insights/dispatch-before-chat", label: "出行与物流" },
      { href: "/landscape", label: "产业地图 · 垂直应用" },
    ],
  },
  {
    slug: "disclosed-rounds",
    pillar: "investing",
    title: "看融资，先问金额有没有被写明",
    lede: "这是阅读框架和风险提示，用来对照站内的融资页和产业地图。",
    publishedOn: "2026-10-01",
    blocks: [
      {
        paragraphs: [
          "融资页有一条硬规则：只加总源里写明的美元。其他币种不换算，没写金额的保持未披露，示意数据会标明。拿没写明的数字做比较，结论会比材料看起来更完整。",
          "一轮融资可以按地图的六层问：它加厚了哪一层供给。基础模型和芯片经常把金额做大。垂直应用更该对着流程有没有离开试点来看。源里没有的估值，页面不会补。后补的数字不适合当成安全边际。",
          "风险也按层看。算力供给收紧时，速度和价格会一起变，能力的故事覆盖不了账单。智能体若没有审计轨迹，企业预算会停在试点。垂直应用的收入若仍来自演示，融资新闻只说明有人愿意为实验付钱。开源权重改变的是成本结构，份额是另一件事。",
          "这些句子只帮助阅读站内已经公开的栏目。它们停在框架，不到任何证券、基金或具体轮次的买卖。",
        ],
      },
    ],
    related: [
      { href: "/funding", label: "融资" },
      { href: "/landscape", label: "产业地图" },
      { href: "/insights/six-layers", label: "六类供给" },
    ],
  },
];

export function getInsight(slug: string): Insight | undefined {
  return insights.find((item) => item.slug === slug);
}

export function pillarLabel(id: InsightPillar): string {
  return pillars.find((item) => item.id === id)?.label ?? id;
}
