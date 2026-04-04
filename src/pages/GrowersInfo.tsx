import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { DollarSign, CreditCard, MapPin, Scale, Scissors, TreePine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const WHY_JOIN = [
  { icon: DollarSign, titleEn: '100% Payout Record', titleZh: '100%付款记录', descEn: 'We have paid out every season since 2010', descZh: '自2010年以来每季按时付款' },
  { icon: CreditCard, titleEn: 'Grower Credit', titleZh: '牧场主信用额度', descEn: 'Use your fibre supply as credit toward purchasing our products at below-wholesale prices', descZh: '用您的纤维供应作为信用额度，以低于批发价购买产品' },
  { icon: MapPin, titleEn: 'Collection Points', titleZh: '收集站点', descEn: 'We have pickup points across all of New Zealand', descZh: '全新西兰设有收集站点' },
  { icon: Scale, titleEn: 'Fair Grading', titleZh: '公平分级', descEn: 'Fibre is graded by colour and micron at our Cromwell facility', descZh: '在我们的Cromwell工厂按颜色和微米数分级' },
];

const STEPS = [
  { en: 'Register online', zh: '在线注册' },
  { en: 'Complete a Fibre Consignment Receipt (FCR)', zh: '填写纤维委托收据 (FCR)' },
  { en: 'Drop your fibre at the nearest collection point', zh: '将纤维送到最近的收集站点' },
  { en: 'Fibre is transported to Cromwell for grading and scouring', zh: '纤维运送至Cromwell进行分级和清洗' },
  { en: 'Receive your payout the following November–December', zh: '在次年11月-12月收到付款' },
];

// Collection Points Data
const COLLECTION_NORTH = [
  { name: 'Matakana Alpacas', contact: 'Cushla de Clare', phone: '027 850 0295', region: 'Maungatapere, Northland' },
  { name: 'Silverhill', contact: 'Valerie Bushell', phone: '027 486 8756', region: 'Matakohe' },
  { name: 'Gumtree Gully', contact: 'Kathy Roscoe', phone: '021 577 789', region: 'Warkworth' },
  { name: 'Pacific Alpacas Head Office No 2', contact: 'Steve', phone: '021 640 707', region: 'Albany Auckland' },
  { name: 'Jan White', contact: 'Jan White', phone: '07 826 4460', region: 'Te Kauwhata' },
  { name: 'Kisimul Farm Alpacas', contact: 'Jan and Roger', phone: '021 303 323 / 021 623 613', region: 'Te Ranga' },
  { name: 'Q Taz Alpacas', contact: 'Lyn Skilling', phone: '07 862 4646', region: 'Paeroa' },
  { name: 'Nevalea Alpacas', contact: 'Leonie or Neville Walker', phone: '07 896 6333', region: 'Taumarunui' },
  { name: 'Hill Country Alpacas', contact: 'Laraine Carter', phone: '021 122 8952', region: 'Katikati' },
  { name: 'Lisa Reeves', contact: 'Lisa Reeves', phone: '022 324 5442', region: 'Ohauiti Tauranga' },
  { name: 'Bruden Alpacas', contact: 'Denise and Bruce', phone: '027 500 5016', region: 'Ngongotaha, Rotorua' },
  { name: 'Brenor Alpacas', contact: 'Brendra Gainsford', phone: '07 332 2336', region: 'Ngongotaha, Rotorua' },
  { name: 'Bonnack Grove Alpacas', contact: 'Peter & Stephanie', phone: '021 144 8043', region: 'Feilding' },
  { name: 'West Peak Alpacas', contact: 'Greg Player', phone: '021 471 875', region: 'New Plymouth' },
  { name: 'Raydene', contact: 'Yvonne or Donald Monk', phone: '06-857 7221', region: 'Waipawa' },
  { name: 'Silverleigh Alpacas', contact: 'Lynette & Stephen Gopperth', phone: '06 754 8147', region: 'Waitara' },
  { name: 'Te Korito Alpacas', contact: 'Stephen Kellam', phone: '021 813 746', region: 'Wanganui' },
  { name: 'Legacy Alpacas', contact: 'Marion', phone: '021 123 00439', region: 'Masterton Clateville' },
  { name: 'Nohoroa Farming Partnership', contact: 'John & Tricia Leighton', phone: '021 101 7535', region: 'Masterton Waikanae' },
  { name: 'Koroki Alpacas', contact: 'Cherryl', phone: '06 379 7892', region: 'Carterton' },
  { name: 'Cynthia Ogilvy', contact: 'Cynthia', phone: '022 355 0337', region: 'Katikati' },
];

const COLLECTION_SOUTH = [
  { name: 'Chris Kempthorne', contact: 'Chris Kempthorne', phone: '027 606 2874', region: 'Brightwater, Nelson' },
  { name: 'Drysdale Alpaca', contact: 'Angela McNaughton', phone: '021 45 6234', region: 'Alexandra' },
  { name: 'Little Oaks Alpacas', contact: 'Allan Grant', phone: '027 227 5430', region: 'Oamaru' },
  { name: 'Geardale Alpacas', contact: 'Philip Geary', phone: '027 208 0027', region: 'Gore' },
  { name: 'Cornish Point Development Ltd (Head Office No1)', contact: 'Jason', phone: '021 484 936', region: 'Cromwell' },
  { name: 'Bruce Farm Alpacas', contact: 'Kim & Kathryn Palin', phone: '027 55 0796', region: 'Hillend' },
  { name: 'Farmers Corner', contact: 'Letitia', phone: '027 244 6872', region: 'Ashburton' },
  { name: 'Karaka Alpacas', contact: 'Greg Knox', phone: '027 758 4736', region: 'Dunedin' },
  { name: 'Chris Dahlberg', contact: 'Chris Dahlberg', phone: '021 663 334', region: 'North Canterbury' },
  { name: 'The Wool Shed & More', contact: 'Sandy', phone: '021 631 793', region: 'Waikouaiti' },
  { name: 'Otaio Bridge Alpacas', contact: 'Ineke Van Neuren', phone: '021 0243 6087', region: 'Waimate (Timaru)' },
  { name: 'Sunstone Alpacas', contact: 'Simon Newcombe', phone: '027 410 0418', region: 'Timaru' },
  { name: 'Kepler Mountain', contact: 'Jessie Haanen', phone: '027 354 5960', region: 'Manapouri' },
  { name: 'Pak Co Limited', contact: 'Peter & Anita Kingma', phone: '027 278 9806', region: 'Milton' },
  { name: 'Chainey', contact: 'Shelly Chainey', phone: '027 229 9367', region: 'Makarewa, Invercargill' },
  { name: 'Alpaca Gully', contact: 'Jenny', phone: '021 038 5320', region: 'Greta Valley' },
];

// Shearers Data
const SHEARERS = [
  { name: 'Allan Oldfield', contact: '027 529 2491', region: 'Wellington, Wairarapa, Horowhenua to Palmerston North', nails: true, injection: true },
  { name: "Sean's Shearing (Andy)", contact: '027 309 4453', region: 'North Island', nails: true, injection: true },
  { name: 'Shear Light (Cass)', contact: '021 034 9950', region: 'Nationwide', nails: true, injection: true },
  { name: 'Daniel Wark', contact: '03 485 9771', region: 'Central Otago', nails: false, injection: false },
  { name: 'Ebel Shearing Services', contact: 'alpaca-shearing.com', region: 'Nationwide', nails: true, injection: true },
  { name: 'Thief of Hearts (Eric Lister)', contact: '027 325 8101', region: 'Palmerston North', nails: true, injection: true },
  { name: 'Eweniversal Shearing', contact: '022 078 0919', region: 'Canterbury, Otago, Southland', nails: true, injection: true },
  { name: 'Gallagher (Cass & Ron)', contact: 'email only', region: '—', nails: false, injection: false },
  { name: 'Gus Patterson', contact: '027 303 0544', region: 'Canterbury, Otago', nails: true, injection: true },
  { name: 'James Dixon', contact: '0061-242-570-120', region: 'Otago, Canterbury', nails: true, injection: true },
  { name: 'JB Farm Services (Jared Bambry)', contact: '027 259 5062', region: 'Hawkes Bay to Wellington', nails: true, injection: true },
  { name: 'Jeremy Martin', contact: '022 301 9912', region: 'Northland, Auckland, Waikato', nails: true, injection: true },
  { name: 'Waiheke Alpaca (Keenan & Lisa Scott)', contact: '021 033 5589', region: 'North Island', nails: true, injection: true },
  { name: 'Laura Schwerdtfeger (Lifestyle Vets)', contact: '027 838 5433', region: 'Auckland, Rodney (Emergency)', nails: false, injection: false },
  { name: 'Leon Jovanovic', contact: '027 372 8860', region: 'Western Bay of Plenty', nails: true, injection: true },
  { name: 'Mesa Land', contact: '027-442-6847', region: 'Northland', nails: false, injection: false },
  { name: 'Matthews Shearing (Michael Matthews)', contact: '027 337 8925', region: 'South Island', nails: true, injection: true },
  { name: 'Shearpac (Mike Banks)', contact: '021-256-2839', region: 'Nationwide', nails: true, injection: true },
  { name: 'Mr Clip', contact: '027 485 3234', region: 'Auckland and North', nails: true, injection: true },
  { name: 'Nigel Wood', contact: '027 468 1903', region: 'Nationwide', nails: true, injection: true },
  { name: "Sean's Shearing (Sean)", contact: '027 484 4047', region: 'North Island', nails: true, injection: true },
  { name: 'Shun Oishu', contact: '021-029 31781', region: 'Auckland, Northland, Canterbury', nails: true, injection: true },
  { name: 'Wilton Small Mob Shearing (Mike & Nicola)', contact: '020 4011 7629', region: 'South Canterbury', nails: true, injection: true },
];

// Visit A Farm Data
const FARMS_NORTH = [
  { name: 'Cornerstone Alpaca Stud', region: 'Gordonton, Waikato', feature: '120+ alpacas, farm shop, 1hr from Auckland', featureZh: '120+羊驼，农场商店，距奥克兰1小时' },
  { name: 'Coroglen Alpacas', region: 'Coromandel Peninsula', feature: 'Farmstay accommodation, 17 acres, ocean views', featureZh: '农庄住宿，17英亩，可观海' },
  { name: 'Hill Country Alpacas', region: 'Katikati, Bay of Plenty', feature: '30 alpacas, handmade fibre textiles', featureZh: '30头驼，自产纤维纺织品' },
  { name: 'Lavender Hill', region: 'Near Auckland', feature: 'B&B accommodation, lavender farm, gift shop', featureZh: 'B&B住宿，薰衣草农庄，礼品店' },
  { name: 'Minffordd Alpaca Farm', region: 'Feilding', feature: 'Cottage accommodation, breeding since 2004', featureZh: '小屋住宿，养驼自2004年' },
  { name: 'Moonacre Alpacas', region: 'Eltham, Taranaki', feature: '60+ alpacas, group bus tours welcome', featureZh: '60+头驼，团体巴士游览欢迎' },
  { name: 'Nevalea Alpacas', region: 'Taumarunui', feature: "NZ's largest alpaca farm, 800+ head, Alpaca Trek", featureZh: '新西兰最大羊驼农场，800+头，羊驼Trek' },
  { name: 'Perfect Alpaca Farm', region: 'South of Warkworth', feature: '64 alpacas, hand-feeding experience', featureZh: '64头驼，手喂体验' },
  { name: 'Revelation NZ Alpaca Stud', region: 'South Island', feature: 'By appointment, farm shop & watercolour gallery', featureZh: '需预约，有农场商店和水彩画廊' },
  { name: 'Silverhill Alpacas', region: 'Northland, Kaipara Harbour', feature: 'Coloured alpaca specialist, harbour views', featureZh: '有色驼专精，可眺望Kaipara港' },
  { name: 'Te Korito Alpacas', region: 'Whanganui', feature: '20 alpacas, led walks, fibre products for sale', featureZh: '20头驼，牵驼散步，羊驼纤维产品销售' },
];

const FARMS_SOUTH = [
  { name: 'Altnaharra Alpacas', region: 'Nelson, Tasman', feature: '27 alpacas, sea & mountain views, needle felting', featureZh: '27头驼，海山风景，针刺毡艺' },
  { name: 'Establo Alpaca Farm', region: 'Dunedin', feature: '27 alpacas, historic bluestone barn, 1860s heritage', featureZh: '27头驼，历史蓝石谷仓，1860年代遗址' },
  { name: 'Gem Alpacas', region: 'South Canterbury', feature: 'Farm visits with alpacas and huarizo', featureZh: '农场参观，含羊驼和羊驼骆马' },
  { name: 'Honeyfields Alpaca Farm', region: '15min from Christchurch Airport', feature: '60+ alpacas, farmstay, honey products', featureZh: '60+头驼，农庄住宿，蜂蜜产品' },
  { name: 'Kepler Mountain View Alpacas', region: 'Lake Manapouri, Fiordland', feature: 'Adjacent to Fiordland National Park, Wild Wool Gallery', featureZh: '毗邻峡湾国家公园，Wild Wool Gallery' },
  { name: 'Otaio Bridge Alpacas', region: 'Waimate, South Timaru', feature: 'Led alpaca walks, handmade souvenirs', featureZh: '可牵驼散步，手工纪念品' },
  { name: "Sacred Coast Suri (Falcon's Rise)", region: 'Blenheim, Marlborough', feature: 'Suri alpaca specialist, farm shop', featureZh: '专精Suri驼，有农场商店' },
  { name: 'Shamarra Alpacas', region: 'Banks Peninsula, Canterbury', feature: '160+ alpacas, luxury knitwear, ocean views', featureZh: '160+头驼，奢华针织品，Banks半岛海景' },
  { name: 'Warwickz Farm', region: 'Canterbury Plains', feature: '200+ animals, 40+ breeds, 20+ species', featureZh: '200+动物，40+品种，20+物种' },
  { name: 'Windermere Alpacas & Llamas', region: 'Milton, Otago', feature: 'Includes llamas, handwoven products', featureZh: '含羊驼骆马，手工编织产品' },
];

type TabKey = 'collection' | 'shearers' | 'farms';

export default function GrowersInfoPage() {
  const { locale } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('collection');

  const renderCollectionTable = (data: typeof COLLECTION_NORTH, islandZh: string, islandEn: string) => (
    <div className="mb-10">
      <h3 className="font-display text-xl font-semibold mb-4 text-gold">
        {locale === 'zh' ? islandZh : islandEn}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3 font-semibold">{locale === 'zh' ? '名称' : 'Name'}</th>
              <th className="text-left p-3 font-semibold">{locale === 'zh' ? '联系人' : 'Contact'}</th>
              <th className="text-left p-3 font-semibold">{locale === 'zh' ? '电话' : 'Phone'}</th>
              <th className="text-left p-3 font-semibold">{locale === 'zh' ? '地区' : 'Region'}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3 text-muted-foreground">{item.contact}</td>
                <td className="p-3">
                  <a href={`tel:${item.phone.replace(/\s/g, '')}`} className="text-gold hover:underline">{item.phone}</a>
                </td>
                <td className="p-3 text-muted-foreground">{item.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFarmsGrid = (data: typeof FARMS_NORTH, islandZh: string, islandEn: string) => (
    <div className="mb-10">
      <h3 className="font-display text-xl font-semibold mb-4 text-gold">
        {locale === 'zh' ? islandZh : islandEn}
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((farm, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-lg border border-border p-5 hover:border-gold/30 transition-colors"
          >
            <h4 className="font-display text-base font-semibold mb-1">{farm.name}</h4>
            <p className="text-xs text-gold font-body mb-2">{farm.region}</p>
            <p className="text-xs text-muted-foreground font-body">{locale === 'zh' ? farm.featureZh : farm.feature}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={locale === 'zh' ? '牧场合作信息 — 太平洋羊驼' : 'Grower Information — Pacific Alpacas'}
        description={locale === 'zh' ? '查找收集点、剪毛师和可参观的羊驼农场' : 'Find collection points, shearers and farms to visit'}
      />
      <Navbar />
      <CartDrawer />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl mb-4">
              {locale === 'zh' ? '成为合作牧场主' : 'Become a Grower Partner'}
            </h1>
            <p className="font-body text-primary-foreground/70 max-w-2xl mx-auto">
              {locale === 'zh'
                ? '太平洋羊驼是新西兰最大的羊驼纤维池。我们与全国900多个牧场和种畜场合作。'
                : "Pacific Alpacas is New Zealand's largest alpaca fibre pool. We partner with over 900 farms and studs across the country."}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="flex-1 py-16">
        <div className="container mx-auto px-6">
          {/* Why Join */}
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="font-display text-2xl md:text-3xl text-center mb-8">
              {locale === 'zh' ? '为什么加入我们' : 'Why Join Us'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {WHY_JOIN.map((item, i) => (
                <motion.div key={item.titleEn} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-lg border border-border p-6 text-center hover:border-gold/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{locale === 'zh' ? item.titleZh : item.titleEn}</h3>
                  <p className="text-xs text-muted-foreground font-body">{locale === 'zh' ? item.descZh : item.descEn}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-2xl md:text-3xl text-center mb-8">
              {locale === 'zh' ? '如何运作' : 'How It Works'}
            </h2>
            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 font-display font-semibold text-sm">
                    {i + 1}
                  </div>
                  <p className="font-body text-sm pt-1.5">{locale === 'zh' ? step.zh : step.en}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Grower Credit */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="bg-gold/10 border border-gold/20 rounded-lg p-8">
              <h3 className="font-display text-xl font-semibold mb-3">
                {locale === 'zh' ? '牧场主信用额度说明' : 'Grower Credit Explained'}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {locale === 'zh'
                  ? '牧场主信用额度是太平洋羊驼向贡献纤维的牧场主提供的产品购买信用额度。它等于您的纤维重量 × 我们对最低等级的估计最低每公斤付款额。'
                  : "Grower Credit is the credit Pacific Alpacas extends to contributing growers toward product purchases. It equals your fibre weight × our estimated minimum payout per kg for the lowest grade."}
              </p>
            </div>
          </div>

          {/* Tabs: Collection Points, Shearers, Visit A Farm */}
          <div className="max-w-6xl mx-auto mb-16">
            <Tabs defaultValue="collection" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="collection" className="font-body text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  {locale === 'zh' ? '收集点' : 'Collection Points'}
                </TabsTrigger>
                <TabsTrigger value="shearers" className="font-body text-sm">
                  <Scissors className="w-4 h-4 mr-2" />
                  {locale === 'zh' ? '剪毛师' : 'Shearers'}
                </TabsTrigger>
                <TabsTrigger value="farms" className="font-body text-sm">
                  <TreePine className="w-4 h-4 mr-2" />
                  {locale === 'zh' ? '参观农场' : 'Visit A Farm'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="collection">
                {renderCollectionTable(COLLECTION_NORTH, '北岛', 'North Island')}
                {renderCollectionTable(COLLECTION_SOUTH, '南岛', 'South Island')}
              </TabsContent>

              <TabsContent value="shearers">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-3 font-semibold">{locale === 'zh' ? '名称' : 'Name'}</th>
                        <th className="text-left p-3 font-semibold">{locale === 'zh' ? '联系方式' : 'Contact'}</th>
                        <th className="text-left p-3 font-semibold">{locale === 'zh' ? '覆盖区域' : 'Coverage'}</th>
                        <th className="text-center p-3 font-semibold">{locale === 'zh' ? '趾甲' : 'Nails'}</th>
                        <th className="text-center p-3 font-semibold">{locale === 'zh' ? '注射' : 'Injection'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SHEARERS.map((s, i) => (
                        <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">{s.name}</td>
                          <td className="p-3">
                            {s.contact.includes('.com') || s.contact === 'email only' ? (
                              <span className="text-muted-foreground">{s.contact}</span>
                            ) : (
                              <a href={`tel:${s.contact.replace(/\s/g, '')}`} className="text-gold hover:underline">{s.contact}</a>
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground">{s.region}</td>
                          <td className="p-3 text-center">{s.nails ? '✓' : '—'}</td>
                          <td className="p-3 text-center">{s.injection ? '✓' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="farms">
                {renderFarmsGrid(FARMS_NORTH, '北岛', 'North Island')}
                {renderFarmsGrid(FARMS_SOUTH, '南岛', 'South Island')}
              </TabsContent>
            </Tabs>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link to="/contact"
              className="inline-block px-10 py-4 bg-accent text-accent-foreground font-body font-semibold rounded-sm tracking-wider hover:bg-accent/90 transition">
              {locale === 'zh' ? '注册成为牧场主' : 'Register as a Grower'}
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
