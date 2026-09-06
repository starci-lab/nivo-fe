import Image from "next/image";
import { Badge, Button, Heading, MediaFrame, Text, TextAction } from "@starci/grammar/common";
import { NivoBrand } from "@nivo/ui";
import { LANDING_COPY, LANDING_DESCRIPTION } from "@/resources/copy";
import { LandingMotionArtworkDrift, LandingMotionHeroReveal, LandingMotionInstanceCard, LandingMotionLightSectionReveal, LandingMotionLoopStep } from "@/components/blocks/landing/LandingMotion";
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
      <nav aria-label={labels.nav}>{labels.navItems.map(item => <TextAction key={item.href} href={item.href} appearance="plain">{item.label}</TextAction>)}</nav>
      <div className={C.headerAction}><Button href="#responsibility-first" size="sm">{hero.primary}</Button></div>
    </header>
    <main id="main">
      <section className={C.hero_sectionShell} aria-labelledby="hero-title">
        <LandingMotionHeroReveal><p className={C.eyebrow}>{hero.eyebrow}</p><div id="hero-title"><Heading level={1}>{hero.title}</Heading></div><Text size="md" tone="muted">{hero.lede}</Text><div className={C.actions}><Button href="#responsibility-first" size="lg" endContent={<Arrow />}>{hero.primary}</Button><Button href="#operating-loop" size="lg" variant="outline">{hero.secondary}</Button></div><Text size="sm" tone="muted">{hero.note}</Text><span className={C.srOnly}>{LANDING_DESCRIPTION}</span></LandingMotionHeroReveal>
        <div className={C.heroVisual}>
          <MediaFrame className={C.heroArtwork} aspect="landscape" fit="cover" treatment="plain">
            <Image src="/images/nivo-unicorn-responsibility-v2.webp" alt={hero.artAlt} width={1536} height={1024} priority sizes="(max-width: 900px) 100vw, 48vw" />
          </MediaFrame>
          <LandingMotionArtworkDrift>
            <div className={C.responsibilityMap} aria-label={hero.mapLabel}><div className={C.mapTop}><Badge tone="success" startContent={<span className={C.statusDot} />}>{hero.mapStatus}</Badge></div><div className={C.mapCenter}><span className={C.mapKicker}>{hero.mapKicker}</span><strong>{hero.mapTitle}</strong><Text size="sm" tone="muted">{hero.mapOwner}</Text></div><div className={C.mapFlow}>{hero.mapFlow.map((item, index) => <span key={item}>{item}{index < hero.mapFlow.length - 1 && <i />}</span>)}</div><div className={C.mapProof}><Check /><span><strong>{hero.proofTitle}</strong><small>{hero.proofBody}</small></span></div></div>
          </LandingMotionArtworkDrift>
        </div>
      </section>
      <section className={C.problem}><div className={C.sectionShell_split}><p className={C.sectionIndex}>{shift.index}</p><div><Heading level={2}>{shift.title}</Heading><p>{shift.body}</p></div></div></section>
      <section id="responsibility" className={C.sectionShell_responsibility}><div className={C.sectionHeading}><p className={C.eyebrow}>{responsibility.eyebrow}</p><Heading level={2}>{responsibility.title}</Heading><p>{responsibility.body}</p></div><div className={C.responsibilityGrid}>{responsibility.items.map((item,index)=><article key={item.title}><span>{String(index+1).padStart(2,"0")}</span><Heading level={3}>{item.title}</Heading><p>{item.body}</p></article>)}</div></section>
      <section id="operating-loop" className={C.loop}><div className={C.sectionShell}><LandingMotionLightSectionReveal><p className={C.eyebrow}>{loop.eyebrow}</p><Heading level={2}>{loop.title}</Heading><p>{loop.lede}</p></LandingMotionLightSectionReveal><ol className={C.loopTrack}>{loop.steps.map((step,index)=><LandingMotionLoopStep key={step} index={index}><span>{String(index+1).padStart(2,"0")}</span><strong>{step}</strong>{index<loop.steps.length-1&&<i aria-hidden="true">{labels.arrow}</i>}</LandingMotionLoopStep>)}</ol><p className={C.loopCaption}>{loop.caption}</p></div></section>
      <section className={C.sectionShell_roles}><p className={C.sectionIndex}>{labels.operatingModel}</p><div className={C.roleGrid}>{roles.map((role,index)=><article key={role.title} className={index===1?C.roleFeatured:undefined}><span>{role.label}</span><Heading level={2}>{role.title}</Heading><p>{role.body}</p></article>)}</div></section>
      <section className={C.intentSection}><div className={C.sectionShell}><div className={C.sectionHeading}><p className={C.eyebrow}>{labels.intentEyebrow}</p><Heading level={2}>{labels.intentTitle}</Heading></div><div className={C.intentGrid}>{intents.map((item,index)=><article key={item.title}><span>{String(index+1).padStart(2,"0")}</span><Heading level={3}>{item.title}</Heading><p>{item.body}</p><a href="#responsibility-first">{labels.explore}<Arrow /></a></article>)}</div></div></section>
      <section className={C.sectionShell_instances}><div><p className={C.eyebrow}>{instances.eyebrow}</p><Heading level={2}>{instances.title}</Heading><p>{instances.body}</p></div><div className={C.instanceStack}>{instances.items.map((item,index)=><LandingMotionInstanceCard key={item.name} index={index}><Badge tone="accent">{item.intent}</Badge><strong>{item.name}</strong><small>{item.meta}</small></LandingMotionInstanceCard>)}</div></section>
      <section id="offer" className={C.offer}><div className={C.sectionShell_offerGrid}><div><p className={C.eyebrow}>{offer.eyebrow}</p><Heading level={2}>{offer.title}</Heading><p>{offer.body}</p></div><div id="responsibility-first" className={C.priceCard}><span>{offer.plan}</span><p className={C.price}><strong>{offer.price}</strong><small>{offer.unit}</small></p><ul>{offer.benefits.map(item=><li key={item}><Check />{item}</li>)}</ul><a className={C.button_buttonFull} href={offer.href}>{hero.primary}<Arrow /></a><p className={C.cardNote}>{offer.note}</p></div></div></section>
    </main>
    <footer><div className={C.sectionShell_footerInner}><NivoBrand props={{ label: "nivo", variant: "lockup", scale: "hero" }} /><p>{labels.mantra}</p><small>{labels.copyright}</small></div></footer>
  </>;
};
