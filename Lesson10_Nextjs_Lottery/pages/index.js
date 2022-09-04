import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
// import ManualHeader from "../components/ManualHeader";
import Header from "../components/Header";
import LotteryEntrance from "../components/LotteryEntrance";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>ETH Lottery</title>
        <meta name="description" content="Following Free-Code-Camp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Header />
        <LotteryEntrance />
      </main>
    </div>
  );
}
