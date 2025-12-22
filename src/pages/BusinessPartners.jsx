import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const PARTNERS = [
    { img: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=258,fit=crop/A85wDMJxW0U0RxO0/whatsapp-image-2024-04-29-at-09.07.48_10f9f073-YleMVEPM5euEOVW1.jpg", link: "https://www.knights-gardencentres.co.uk/", name: "Knights Garden Centres" },
    { img: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=250,fit=crop/A85wDMJxW0U0RxO0/whatsapp-image-2025-06-17-at-08.17.13_c4672dec-AR034bxGrQcwL05K.jpg", link: "https://www.harrowcaterham.co.uk/", name: "Harrow Caterham" },
    { img: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=429,fit=crop/A85wDMJxW0U0RxO0/screenshot-2024-06-07-204103-dJoJMGkoMKHVaK5Z.png", link: "https://www.kingandqueencaterham.co.uk/", name: "The King & Queen" },
    { img: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=289,fit=crop/A85wDMJxW0U0RxO0/white-logo-small-Aq2oMnMgajIK1bxE.jpg", link: "https://champconsultants.co.uk/", name: "Champ Consultants" },
    { img: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=379,fit=crop/A85wDMJxW0U0RxO0/cinnamon-luxury-care-YyvojkJz9lcP2pnP.png", link: "https://www.cinnamoncc.com/care-homes/rokewood-court/", name: "Cinnamon Luxury Care" },
    { img: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=379,fit=crop/A85wDMJxW0U0RxO0/screenshot-2024-06-07-204049-Y4L4zOaZzEibLvMx.png", link: "https://surreynational.co.uk/", name: "Surrey National Golf Club" },
    { img: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=127,fit=crop/A85wDMJxW0U0RxO0/picture1-Yan1WVQ5LDsJrNpz.jpg", link: "https://goldenbrainacademy.com/", name: "Golden Brain Academy" },
    { img: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=211,fit=crop/A85wDMJxW0U0RxO0/screenshot-2024-06-07-204022_upscayl_2x_realesrgan-x4plus-anime-A3QpvanPPaFkQvoR.png", link: "https://www.ramsayhealth.co.uk/hospitals/north-downs-hospital", name: "North Downs Hospital" },
    { img: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=83,fit=crop/A85wDMJxW0U0RxO0/screenshot-2025-07-31-095731-Yyv0O3qEnwuyGgLJ.png", link: "https://www.modalityspa.com/items/modality-medical-spa-caterham", name: "Modality Medical Spa" },
    { img: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=101,fit=crop/A85wDMJxW0U0RxO0/whatsapp-image-2025-09-19-at-08.37.42_fd9d62c2-mxB2jNeDQ9fK0bg7.jpg", link: "https://www.pinksfunerals.co.uk/contact-us/", name: "Pinks Funeral Directors" },
    { img: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=158,fit=crop/A85wDMJxW0U0RxO0/capture-mv0W1EJJMnHRM5Bn.jpeg", link: "https://www.warlinghamtlt.co.uk/", name: "Warlingham" }
];

const BusinessPartners = () => {
    return (
        <>
            <SEO
                title="Business Partners - Caterham Rotary"
                description="We are proud to work with these local businesses. Together we support the Caterham community and charitable causes."
                canonical="/business-partners"
            />
            <div className="container section-padding">
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <motion.h1
                        className="text-gradient"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '3.5rem', marginBottom: '20px' }}
                    >
                        Our Business Partners
                    </motion.h1>
                    <motion.p
                        className="lead-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-secondary)' }}
                    >
                        Our aim is to work in partnership with local businesses on projects throughout the year and seek to promote our partnership at all Rotary events for the benefit of the local community as well as with links internationally.
                    </motion.p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '40px',
                    padding: '0 20px'
                }}>
                    {PARTNERS.map((partner, index) => (
                        <motion.a
                            key={index}
                            href={partner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass-panel"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '30px',
                                borderRadius: '20px',
                                textDecoration: 'none',
                                color: 'inherit',
                                background: 'rgba(255, 255, 255, 0.7)',
                                minHeight: '200px'
                            }}
                        >
                            <div style={{
                                width: '100%',
                                height: '150px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px'
                            }}>
                                <img
                                    src={partner.img}
                                    alt={partner.name}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        filter: 'grayscale(0%) opacity(0.9)',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            </div>
                            <h3 style={{
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                textAlign: 'center',
                                margin: 0
                            }}>
                                {partner.name}
                            </h3>
                        </motion.a>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '60px', padding: '40px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px' }}>
                    <p style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        Interesting in becoming a partner? <a href="mailto:info@caterhamrotary.org.uk" style={{ textDecoration: 'underline' }}>Contact us today</a>.
                    </p>
                </div>
            </div>
        </>
    );
};

export default BusinessPartners;
