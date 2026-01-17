export function MissionSection() {
  return (
    <section
      data-testid="mission-section"
      className="py-16 px-4 text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
          Learning AI, Together
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          Alongside AI is a community-driven platform where AI enthusiasts, developers,
          and curious minds come together to learn, experiment, and grow. We believe
          that understanding AI shouldn&apos;t be reserved for experts alone—it should be
          accessible to everyone who wants to shape the future of technology.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          Through hands-on workshops, collaborative projects, and shared experiments,
          we&apos;re building a space where practical AI knowledge flows freely and innovation
          happens alongside each other.
        </p>
      </div>
    </section>
  );
}
