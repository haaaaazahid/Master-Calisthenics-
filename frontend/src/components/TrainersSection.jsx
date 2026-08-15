import { motion } from "framer-motion";

const trainers = [
  {
    name: "Coach Bali",
    role: "Strength & Skills"
  },
  {
    name: "Coach Aman",
    role: "Mobility Expert"
  },
  {
    name: "Coach Aryan",
    role: "Transformation Coach"
  }
];

const TrainersSection = () => {
  return (
    <section className="py-32 px-6 bg-bg">

      <div className="max-w-7xl mx-auto">

        <h2 className="text-6xl text-center mb-20">
          OUR TRAINERS
        </h2>

        <div className="grid md:grid-cols-3 gap-10">

          {trainers.map((trainer, index) => (

            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="bg-surface border border-border rounded-3xl overflow-hidden"
            >

              <div className="h-[400px] bg-gradient-to-br from-orange-500 to-orange-800"></div>

              <div className="p-8">

                <h3 className="text-3xl text-orange-500">
                  {trainer.name}
                </h3>

                <p className="text-text-muted mt-4">
                  {trainer.role}
                </p>

              </div>

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  );
};

export default TrainersSection;