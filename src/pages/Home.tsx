import SEO from '@components/common/SEO'
import { LOCAL_BUSINESS_SCHEMA } from '@constants/schema'
import HeroSection from '@components/home/HeroSection'
import TrustIndicators from '@components/home/TrustIndicators'
import AboutPreview from '@components/home/AboutPreview'
import ServicesSection from '@components/home/ServicesSection'
import WhyChooseUs from '@components/home/WhyChooseUs'
import MeetChildminder from '@components/home/MeetChildminder'
import DailyActivities from '@components/home/DailyActivities'
import GalleryPreview from '@components/home/GalleryPreview'
import TestimonialsSection from '@components/home/TestimonialsSection'
import FAQsSection from '@components/home/FAQsSection'
import CTASection from '@components/home/CTASection'

export default function Home() {
  return (
    <>
      <SEO
        title="Divine Heritage Childcare Service | Ofsted Registered Childminder in Bermondsey, London SE16"
        description="Nurturing, Ofsted registered home-based childminding in Bermondsey, London SE16. EYFS early years care (5 months–3 years), after-school care, large playroom and secure garden."
        path="/"
        schema={LOCAL_BUSINESS_SCHEMA}
      />
      <HeroSection />
      <TrustIndicators />
      <AboutPreview />
      <ServicesSection />
      <WhyChooseUs />
      <MeetChildminder />
      <DailyActivities />
      <GalleryPreview />
      <TestimonialsSection />
      <FAQsSection />
      <CTASection />
    </>
  )
}
