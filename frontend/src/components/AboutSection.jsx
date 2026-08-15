import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section className="py-32 px-6 bg-bg-secondary">

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">

        {/* LEFT */}

        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >

          <h2 className="text-6xl mb-8">
            WHY
            <span className="text-orange-500"> MCI?</span>
          </h2>

          <p className="text-text-muted text-lg leading-9">
            Master Calisthenics India focuses on elite bodyweight
            strength, aesthetics, mobility and athletic performance.

            Our mission is to create stronger individuals physically
            and mentally through disciplined training and real coaching.
          </p>

          <button className="mt-10 bg-orange-500 text-black px-8 py-4 rounded-xl font-bold">

            Learn More

          </button>

        </motion.div>

        {/* RIGHT */}

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="h-[500px] rounded-3xl bg-gradient-to-br from-orange-500 to-orange-800"
        />

      </div>

    </section>
  );
};

export default AboutSection;