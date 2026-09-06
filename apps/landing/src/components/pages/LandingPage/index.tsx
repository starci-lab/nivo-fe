import { Heading } from "@starci/grammar/common";
import { NivoBrand } from "@nivo/ui";
import { LANDING_COPY } from "@/resources/copy";
import { CLASS_NAMES as C } from "./classNames";

const Arrow = () => <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" /></svg>;
const Check = () => <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m4 10 4 4 8-9" /></svg>;

/** Props accepted by the static public landing surface. */
export type LandingPageProps = Record<string, never>;

/** Renders the public NIVO Agentic OS product narrative and entry offer. */
export const LandingPage = (props: LandingPageProps) => {
  void props;
  const { hero, shift, responsibility, loop, roles, intents, instances, offer, labels } = LANDING_COPY;
  return <>
    <a className={C.skipLink} href="#main">{labels.skip}</a>
    <header className={C.siteHeader}>
      <a href="#main" aria-label={labels.home}><NivoBrand props={{ label: "nivo", variant: "lockup", scale: "hero" }} /></a>
      <nav aria-label={labels.nav}>{labels.navItems.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
      <a className={C.button_buttonSmall} href="#responsibility-first">{hero.primary}</a>
    </header>
    <main id="main">
      <section className={C.hero_sectionShell} aria-labelledby="hero-title">
        <div className={C.heroCopy}><p className={C.eyebrow}>{hero.eyebrow}</p><div id="hero-title"><Heading level={1}>{hero.title}</Heading></div><p className={C.heroLede}>{hero.lede}</p><div className={C.actions}><a className={C.button} href="#responsibility-first">{hero.primary}<Arrow /></a><a className={C.button_buttonGhost} href="#operating-loop">{hero.secondary}</a></div><p className={C.heroNote}>{hero.note}</p></div>
        <div className={C.responsibilityMap} aria-label={hero.mapLabel}><div className={C.mapTop}><span className={C.statusDot} />{hero.mapStatus}</div><div className={C.mapCenter}><span className={C.mapKicker}>{hero.mapKicker}</span><strong>{hero.mapTitle}</strong><span>{hero.mapOwner}</span></div><div className={C.mapFlow}>{hero.mapFlow.map((item, index) => <span key={item}>{item}{index < hero.mapFlow.length - 1 && <i />}</span>)}</div><div className={C.mapProof}><Check /><span><strong>{hero.proofTitle}</strong><small>{hero.proofBody}</small></span></div></div>
      </section>
      <section className={C.problem}><div className={C.sectionShell_split}><p className={C.sectionIndex}>{shift.index}</p><div><Heading level={2}>{shift.title}</Heading><p>{shift.body}</p></div></div></section>
      <section id="responsibility" className={C.sectionShell_responsibility}><div className={C.sectionHeading}><p className={C.eyebrow}>{responsibility.eyebrow}</p><Heading level={2}>{responsibility.title}</Heading><p>{responsibility.body}</p></div><div className={C.responsibilityGrid}>{responsibility.items.map((item,index)=><article key={item.title}><span>{String(index+1).padStart(2,"0")}</span><Heading level={3}>{item.title}</Heading><p>{item.body}</p></article>)}</div></section>
      <section id="operating-loop" className={C.loop}><div className={C.sectionShell}><div className={C.sectionHeading_light}><p className={C.eyebrow}>{loop.eyebrow}</p><Heading level={2}>{loop.title}</Heading><p>{loop.lede}</p></div><ol className={C.loopTrack}>{loop.steps.map((step,index)=><li key={step}><span>{String(index+1).padStart(2,"0")}</span><strong>{step}</strong>{index<loop.steps.length-1&&<i aria-hidden="true">{labels.arrow}</i>}</li>)}</ol><p className={C.loopCaption}>{loop.caption}</p></div></section>
      <section className={C.sectionShell_roles}><p className={C.sectionIndex}>{labels.operatingModel}</p><div className={C.roleGrid}>{roles.map((role,index)=><article key={role.title} className={index===1?C.roleFeatured:undefined}><span>{role.label}</span><Heading level={2}>{role.title}</Heading><p>{role.body}</p></article>)}</div></section>
      <section className={C.intentSection}><div className={C.sectionShell}><div className={C.sectionHeading}><p className={C.eyebrow}>{labels.intentEyebrow}</p><Heading level={2}>{labels.intentTitle}</Heading></div><div className={C.intentGrid}>{intents.map((item,index)=><article key={item.title}><span>{String(index+1).padStart(2,"0")}</span><Heading level={3}>{item.title}</Heading><p>{item.body}</p><a href="#responsibility-first">{labels.explore}<Arrow /></a></article>)}</div></div></section>
      <section className={C.sectionShell_instances}><div><p className={C.eyebrow}>{instances.eyebrow}</p><Heading level={2}>{instances.title}</Heading><p>{instances.body}</p></div><div className={C.instanceStack}>{instances.items.map(item=><article key={item.name}><span>{item.intent}</span><strong>{item.name}</strong><small>{item.meta}</small></article>)}</div></section>
      <section id="offer" className={C.offer}><div className={C.sectionShell_offerGrid}><div><p className={C.eyebrow}>{offer.eyebrow}</p><Heading level={2}>{offer.title}</Heading><p>{offer.body}</p></div><div id="responsibility-first" className={C.priceCard}><span>{offer.plan}</span><p className={C.price}><strong>{offer.price}</strong><small>{offer.unit}</small></p><ul>{offer.benefits.map(item=><li key={item}><Check />{item}</li>)}</ul><a className={C.button_buttonFull} href={offer.href}>{hero.primary}<Arrow /></a><p className={C.cardNote}>{offer.note}</p></div></div></section>
    </main>
    <footer><div className={C.sectionShell_footerInner}><NivoBrand props={{ label: "nivo", variant: "lockup", scale: "hero" }} /><p>{labels.mantra}</p><small>{labels.copyright}</small></div></footer>
  </>;
};
