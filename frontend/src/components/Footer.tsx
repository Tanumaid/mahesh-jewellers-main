const Footer = () => {
  return (
    <footer style={styles.footer}>
      <h2 style={styles.logo}>Mahesh Jewellers</h2>

      <p>Sagar Morusheth Kulthe</p>

      <p>📍 Ashwi Bk, Tal.Sangamner, Dist.Ahilyanagar </p>
      <p>📞 +91 9767275725</p>
      <p>📩 sagarkulthe2017@gmail.com</p>


      <p style={styles.copy}>
        © {new Date().getFullYear()} Mahesh Jewellers. All Rights Reserved.
      </p>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: "#000",
    color: "white",
    textAlign: "center" as const,
    padding: "40px 20px",
    marginTop: "50px",
  },

  logo: {
    color: "#D4AF37",
  },

  copy: {
    marginTop: "20px",
    fontSize: "14px",
    opacity: 0.7,
  },
};

export default Footer;
