const programs = [

  {
    title: "Group Batch Training",
    desc: "Train Together. Grow Stronger.",
    price: "₹4,000/month",
  },

  {
    title: "Personal Training",
    desc: "Personal Attention. Faster Results.",
    price: "₹9,600/8 sessions",
  },

  {
    title: "Group Personalized",
    desc: "Small Group. Big Results.",
    price: "₹7,999/month",
  },

];

const ProgramsSection = () => {
  return (

    <section className="py-32 px-6 bg-[#0F172A]">

      <div className="max-w-7xl mx-auto">

        <h2 className="text-5xl md:text-7xl text-center mb-20">

          OUR PROGRAMS

        </h2>

        <div className="grid md:grid-cols-3 gap-10">

          {programs.map((program, index) => (

            <div
              key={index}
              className="bg-[#111827] border border-gray-800 rounded-[30px] p-10 hover:border-orange-500 transition duration-500"
            >

              <h3 className="text-3xl mb-6 text-orange-500">

                {program.title}

              </h3>

              <p className="text-gray-400 leading-8 mb-10">

                {program.desc}

              </p>

              <div className="text-4xl font-bold mb-10">

                {program.price}

              </div>

              <button className="w-full bg-orange-500 hover:bg-orange-600 transition py-4 rounded-2xl text-black font-bold">

                JOIN NOW

              </button>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
};

export default ProgramsSection;