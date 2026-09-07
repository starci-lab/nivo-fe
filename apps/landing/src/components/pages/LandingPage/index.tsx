import Image from "next/image";
import { Badge, Button, Heading, MediaFrame, Text, TextAction } from "@starci/grammar/common";
import { NivoBrand, NivoIcon } from "@nivo/ui";
import { LANDING_COPY, LANDING_DESCRIPTION } from "@/resources/copy";
import { LandingMotionArtworkDrift, LandingMotionHeroReveal, LandingMotionInstanceCard, LandingMotionLightSectionReveal, LandingMotionLoopStep, LandingMotionLoopTrack, LandingMotionResponsibilityGraph, LandingMotionRoleLayer } from "@/components/blocks/landing/LandingMotion";
import { CLASS_NAMES as C } from "./classNames";

/** Props accepted by the static public landing surface. */
export type LandingPageProps = Record<string, never>;

const INTENT_ICONS = ["apps", "overview", "agentos", "wallet"] as const;
const LOOP_ICONS = ["community", "agentos", "servers", "search", "code", "talents"] as const;
const ROLE_ART = ["/images/handoff-human-v1.png", "/images/handoff-ai-v1.png", "/images/handoff-system-v1.png"] as const;

/** Renders the public NIVO Agentic OS product narrative and entry offer. */
export const LandingPage = (props: LandingPageProps) => {
  void props;
  const { hero, loop, roles, intents, instances, offer, footer, labels } = LANDING_COPY;

  return <>
    <a className={C.skipLink} href="#main">{labels.skip}</a>
    <header className={C.siteHeader}>
      <a href="#main" aria-label={labels.home}><NivoBrand props={{ label: "nivo", variant: "lockup", scale: "navbar" }} /><span className={C.brandMeta}>Agentic OS</span></a>
      <nav aria-label={labels.nav}>{labels.navItems.map(item => <TextAction key={item.href} href={item.href} appearance="plain">{item.label}</TextAction>)}</nav>
      <div className={C.headerAction}><Button href="#responsibility-first" size="sm" variant="primary" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{hero.primary}</Button></div>
    </header>

    <main id="main">
      <section className={C.hero_sectionShell} aria-labelledby="hero-title">
        <LandingMotionHeroReveal>
          <p className={C.eyebrow}>{hero.eyebrow}</p>
          <div id="hero-title"><Heading level={1}>{hero.title}</Heading></div>
          <Text size="md" tone="muted">{hero.lede}</Text>
          <div className={C.actions}>
            <Button href="#responsibility-first" size="lg" variant="primary" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{hero.primary}</Button>
            <Button href="#operating-loop" size="lg" variant="outline" endContent={<NivoIcon props={{ name: "disclosure", usage: "chip" }} />}>{hero.secondary}</Button>
          </div>
          <p className={C.heroFlow}>{loop.steps.map((step, index) => <span key={step}>{step}{index < loop.steps.length - 1 && <i aria-hidden="true">→</i>}</span>)}</p>
          <span className={C.srOnly}>{LANDING_DESCRIPTION}</span>
        </LandingMotionHeroReveal>

        <div className={C.heroVisual}>
          <MediaFrame className={C.heroArtwork} aspect="landscape" fit="cover" treatment="plain">
            <Image src="/images/nivo-unicorn-responsibility-transparent-v4.png" alt={hero.artAlt} width={1536} height={1024} priority sizes="(max-width: 900px) 100vw, 58vw" />
          </MediaFrame>
          <LandingMotionResponsibilityGraph>
            <svg aria-hidden="true" viewBox="0 0 640 440" preserveAspectRatio="none"><path d="M62 318C150 372 219 382 302 326S438 172 579 124" /><path d="M64 318C182 260 235 155 327 146s148 52 252-22" /></svg>
            {loop.steps.map((step, index) => <span key={step} className={C.graphNode} data-node={index + 1}><i aria-hidden="true" />{step}</span>)}
          </LandingMotionResponsibilityGraph>
        </div>
        <LandingMotionArtworkDrift>
          <div className={C.responsibilityMap} aria-label={hero.mapLabel}>
            <div className={C.mapTop}><Badge tone="success">{hero.mapStatus}</Badge><NivoIcon props={{ name: "complete", usage: "heading", ariaLabel: hero.mapStatus }} /></div>
            <div className={C.mapCenter}><span className={C.mapKicker}>{hero.mapKicker}</span><strong>{hero.mapTitle}</strong><Text size="sm" tone="muted">{hero.mapOwner}</Text></div>
            <div className={C.mapProof}><span><strong>{hero.proofTitle}</strong><small>{hero.proofBody}</small></span><Badge tone="success">{hero.proofBadge}</Badge></div>
          </div>
        </LandingMotionArtworkDrift>
      </section>

      <section id="operating-loop" className={C.loop}>
        <div className={C.sectionShell}>
          <LandingMotionLightSectionReveal><p className={C.eyebrow}>{loop.eyebrow}</p><Heading level={2}>{loop.title}</Heading><p>{loop.lede}</p></LandingMotionLightSectionReveal>
          <LandingMotionLoopTrack><ol className={C.loopTrack}>{loop.steps.map((step, index) => <LandingMotionLoopStep key={step} index={index}><span>{String(index + 1).padStart(2, "0")}</span><div className={C.loopGlyph}><NivoIcon props={{ name: LOOP_ICONS[index], usage: "heading" }} /></div><strong>{step}</strong><small>{loop.stepBodies[index]}</small></LandingMotionLoopStep>)}</ol></LandingMotionLoopTrack>
        </div>
      </section>

      <section id="responsibility" className={C.sectionShell_roles}>
        <div className={C.roleIntro}><p className={C.eyebrow}>{labels.operatingModel}</p><Heading level={2}>{labels.operatingModelTitle}</Heading><p>{labels.operatingModelBody}</p><TextAction href="#intent-modules" appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{labels.exploreOperating}</TextAction></div>
        <svg className={C.roleRail} aria-hidden="true" viewBox="0 0 920 96" preserveAspectRatio="none"><defs><linearGradient id="responsibility-pipe" x1="0" x2="1"><stop stopColor="#e72b32"/><stop offset="1" stopColor="#ff7469"/></linearGradient><filter id="pipe-glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><marker id="pipe-arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M1 1 10 6 1 11" fill="none" stroke="#ff5d54" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></marker></defs><path d="M18 76V50Q18 36 32 36H892" fill="none" stroke="url(#responsibility-pipe)" strokeWidth="9" strokeLinecap="round" markerEnd="url(#pipe-arrow)" filter="url(#pipe-glow)"/><path d="M28 32H884" fill="none" stroke="rgba(255,255,255,.52)" strokeWidth="2" strokeLinecap="round"/></svg>
        <div className={C.roleGrid}>{roles.map((role, index) => <LandingMotionRoleLayer key={role.title} index={index}><div className={C.roleIcon}><Image src={ROLE_ART[index]} alt="" width={1254} height={1254} sizes="260px" /></div><span>{role.label}</span><Heading level={3}>{role.title}</Heading><p>{role.body}</p><Badge tone={index === 0 ? "danger" : index === 1 ? "accent" : "neutral"}>{role.verb}</Badge></LandingMotionRoleLayer>)}</div>
      </section>

      <section id="intent-modules" className={C.intentSection}>
        <div className={C.sectionShell}>
          <div className={C.sectionHeading}><p className={C.eyebrow}>{labels.intentEyebrow}</p><Heading level={2}>{labels.intentTitle}</Heading></div>
          <div className={C.intentGrid}>{intents.map((item, index) => <article key={item.title} data-intent={index + 1}><div className={C.intentTitle}><NivoIcon props={{ name: INTENT_ICONS[index], usage: "heading" }} /><Heading level={3}>{item.title}</Heading></div><p>{item.body}</p><div className={C.intentArtwork}><Image src={item.art} alt={item.artAlt} width={1536} height={1152} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw" /></div></article>)}</div>
        </div>
      </section>

      <section id="module-instances" className={C.instancesTheatre}>
        <div className={C.sectionShell_instances}>
          <div className={C.instancesHeading}><p className={C.eyebrow}>{instances.eyebrow}</p><Heading level={2}>{instances.title}</Heading><p>{instances.body}</p></div>
          <div className={C.instanceStack}>{instances.items.map((item, index) => <LandingMotionInstanceCard key={item.name} index={index}><div className={C.instanceTop}><strong>{item.name}</strong><Badge tone={item.tone}>{item.intent}</Badge></div><dl><div><dt>{instances.owner}</dt><dd>{item.owner}</dd></div><div><dt>{instances.status}</dt><dd>{item.status}</dd></div><div><dt>{instances.outcome}</dt><dd>{item.outcome}</dd></div></dl><div className={C.instanceEvidence}><NivoIcon props={{ name: "complete", usage: "chip" }} /><span>{item.evidence}</span></div></LandingMotionInstanceCard>)}</div>
        </div>
      </section>

      <section id="offer" className={C.offer}>
        <div id="responsibility-first" className={C.sectionShell_offerGrid}>
          <div className={C.offerArtwork}><Image src="/images/nivo-unicorn-responsibility-transparent-v4.png" alt="" width={1536} height={1024} sizes="320px" /></div>
          <div className={C.offerCopy}><Heading level={2}>{offer.title}</Heading><p>{offer.body}</p><ul>{offer.benefits.map(item => <li key={item}><NivoIcon props={{ name: "complete", usage: "chip" }} />{item}</li>)}</ul></div>
          <Button href={offer.href} size="lg" variant="outline" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{hero.primary}</Button>
        </div>
      </section>
    </main>

    <footer><div className={C.sectionShell_footerInner}>
      <div className={C.footerBrand}><NivoBrand props={{ label: "nivo", variant: "lockup", scale: "hero" }} /><span>Agentic OS</span><p>{labels.mantra}</p></div>
      <div className={C.footerDirectory}>{footer.groups.map(group => <section key={group.title}><strong>{group.title}</strong><nav aria-label={group.title}>{group.items.map(item => <TextAction key={`${group.title}-${item.label}`} href={item.href} appearance="plain">{item.label}</TextAction>)}</nav></section>)}</div>
      <section className={C.footerNewsletter}><strong>{footer.newsletterTitle}</strong><p>{footer.newsletterBody}</p><TextAction href={footer.newsletterHref} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{footer.newsletterAction}</TextAction></section>
      <small>{labels.copyright}</small>
    </div></footer>
  </>;
};
