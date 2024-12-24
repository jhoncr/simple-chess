/** @type {import('next').NextConfig} */
const nextConfig = {
  //   reactStrictMode: true,
  //   webpack5: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  output: "export",
};

export default nextConfig;
