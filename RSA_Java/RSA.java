import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Random;
import java.util.Scanner;

public class RSA {

	public static void main(String[] args) {
		boolean done = false;
		Scanner keyboard = new Scanner(System.in);
		// do while loop gets user Input for 3 options
		do {
			System.out.println();
			System.out.println(
					"Would you like to encode (1), decode (2), or generate a public key (3)? Type 4 to be Done.");
			int userChoice = keyboard.nextInt();
			keyboard.nextLine();
			// user wants to encrypt a message
			if (userChoice == 1) {
				System.out.println("What is your message to be encrypted?");
				String userMessage = keyboard.nextLine();
				userMessage.trim();
				System.out.println("What is your public key n?");
				BigInteger n1 = keyboard.nextBigInteger();
				ArrayList<String> messages = splitMessage(userMessage, 214);
				System.out.println("What is your public key e?");
				BigInteger e1 = keyboard.nextBigInteger();
				ArrayList<BigInteger> encryptedMessage = encrypt(messages, e1, n1);
				System.out.println(encryptedMessage.toString());
				for (int i = 0; i < encryptedMessage.size(); i++) {
					System.out.print(encryptedMessage.get(i));
				}
			}
			// user wants to decrypt a message
			if (userChoice == 2) {
				System.out.println("How many blocks of cipher text are you decrypting?");
				int numBlocks = keyboard.nextInt();
				System.out.println("What is the public key n?");
				BigInteger n2 = keyboard.nextBigInteger();
				System.out.println("What is the private key d?");
				BigInteger d1 = keyboard.nextBigInteger();
				for (int i = 0; i < numBlocks; i++) {
					System.out.println("What is your number " + i + " encrypted message that you want decrypted");
					BigInteger userMessage = keyboard.nextBigInteger();
					System.out.println(decrypt(userMessage, d1, n2));
				}
			}
			// user wants to generate keys
			if (userChoice == 3) {
				ArrayList<BigInteger> keys = generateKeyPrimes();
				BigInteger n3 = keys.get(0).multiply(keys.get(1));
				BigInteger q3 = keys.get(0);
				BigInteger p3 = keys.get(1);
				System.out.println("Your public key n is: " + n3);
				BigInteger phi = phi(p3, q3);
				BigInteger e3 = findRelativelyPrimeE(phi);
				System.out.println("Your public key e is: " + e3);
				BigInteger d3 = extendedEuclidean(e3, phi);
				// System.out.println(d3.multiply(e3).mod(phi));
				System.out.println("phi: " + phi);
				System.out.println("Your private key d is: " + d3);

			}
			if (userChoice == 4) {
				done = true;
			}

		} while (done == false);
		keyboard.close();
		BigInteger test = new BigInteger("30802885190380467687299274914090140600778912348588561418086721819880368078450010736878347314638511528852976446501675815876514404800898272335185947074466022767785089529636765573189511735368815552515975416044877998967923844341034878267497331292916630292410875063524912815664467325765493437831553894538277740193");
		System.out.println(isPrime(test));
	}

	// method that generates the keys for p, q, n
	public static ArrayList<BigInteger> generateKeyPrimes() {
		ArrayList<BigInteger> pq = new ArrayList<BigInteger>();
		int numOfPrimes = 0;
		int primesTried = 0;
		while (numOfPrimes < 2) {
			BigInteger bi = randomBigInt();
			if (bi.mod(BigInteger.TWO).equals(BigInteger.ZERO)
					|| bi.mod(BigInteger.TWO.add(BigInteger.ONE)).equals(BigInteger.ZERO)) {
			} else if (isPrime(bi) == false) {
				primesTried++;
			} else {
				numOfPrimes++;
				pq.add(bi);
			}
		}
		System.out.println("Number of random 2048-Bit integers tried before finding both primes: " + primesTried);
		System.out.println(
				"The first prime q for key n is: " + pq.get(0) + "\n , Probability: 1 in 100 Trillion");
		System.out.println("The second prime p for key n is: " + pq.get(1) + "\n , Probability: 1 in 100 Trillion");
		return pq;
	}

	public static ArrayList<BigInteger> encrypt(ArrayList<String> messages, BigInteger e, BigInteger n) {
		ArrayList<BigInteger> encodedMessage = new ArrayList<BigInteger>();
		System.out.println("SIZE: " + messages.size());
		for (int i = 0; i < messages.size(); i++) {
			BigInteger asciiValue = BigInteger.ZERO;
			for (int j = 0; j < messages.get(i).length(); j++) {
				int charValue = (int) messages.get(i).charAt(j);
				BigInteger byteValue = BigInteger.valueOf(charValue);
				asciiValue = asciiValue.shiftLeft(8).add(byteValue);
			}
			BigInteger encryptedBlock = asciiValue.modPow(e, n);
			encodedMessage.add(encryptedBlock);
		}
		return encodedMessage;
	}

	public static String decrypt(BigInteger ciphertext, BigInteger d, BigInteger n) {
		String decodedMessage = "";
		ciphertext = ciphertext.modPow(d, n);
		byte[] byteBlocks = ciphertext.toByteArray();
		for (int i = 0; i < byteBlocks.length; i++) {
			decodedMessage += (char) byteBlocks[i];
		}
		return decodedMessage;
	}

	// Helper method that splits a user's message into blocks of a given size
	public static ArrayList<String> splitMessage(String m, int blockSize) {
		ArrayList<String> blocks = new ArrayList<String>();
		for (int i = 0; i < m.length(); i += blockSize) {
			String block = m.substring(i, Math.min(i + blockSize, m.length()));
			blocks.add(block);
		}
		return blocks;
	}

	// method that takes in your key n and finds a random e, relatively prime to it
	public static BigInteger findRelativelyPrimeE(BigInteger n) {
		Random random = new Random();
		BigInteger a;
		do {
			a = new BigInteger(n.bitLength(), random);
		} while (a.compareTo(n) >= 0 || a.compareTo(BigInteger.ONE) <= 0 || !GCD(a, n).equals(BigInteger.ONE));
		return a;
	}

	// generates a random Big Integer 128 bytes in size (for p and q)
	public static BigInteger randomBigInt() {
		Random random = new Random();
		byte[] randomBytes = new byte[128]; // 2048 bits = 256 bytes
		random.nextBytes(randomBytes);
		BigInteger randomNumber = new BigInteger(1, randomBytes);
		return randomNumber;
	}

	// isPrime method used to tell if a BigInteger is prime, used to generate keys
	public static boolean isPrime(BigInteger n) {
		for (int i = 0; i < 55; i++) {
			Random random = new Random();
			BigInteger a;
			do {
				a = new BigInteger(n.bitLength(), random);
			} while (a.compareTo(n) >= 0 || a.compareTo(BigInteger.ONE) <= 0 || !GCD(a, n).equals(BigInteger.ONE));
			BigInteger modExp = a.modPow((n.subtract(BigInteger.ONE)).divide(BigInteger.TWO), n);
			if (modExp.equals(n.subtract(BigInteger.ONE))) {
				modExp = BigInteger.ZERO.subtract(BigInteger.ONE);
			}
			if (!modExp.equals(BigInteger.ONE) && !modExp.equals(BigInteger.ZERO.subtract(BigInteger.ONE))) {
				return false;
			}
			if (!JacobiSymbol(a, n).equals(modExp)) {
				return false;
			}
		}
		return true;
	}
	// GCD function return the greatest common divisor of two big ints
	public static BigInteger GCD(BigInteger n, BigInteger m) {
		BigInteger temp;
		while (!m.equals(BigInteger.ZERO)) {
			temp = m;
			m = n.mod(m);
			n = temp;
		}
		return n;
	}

	// Jacobi Symbol function used to test primality of Big Integers
	public static BigInteger JacobiSymbol(BigInteger m, BigInteger n) {
		BigInteger result = BigInteger.ONE;
		while (!m.equals(BigInteger.ZERO)) {
			while (m.mod(BigInteger.TWO).equals(BigInteger.ZERO)) {
				m = m.divide(BigInteger.TWO);
				BigInteger eight = BigInteger.valueOf(8);
				BigInteger r = n.mod(eight);
				if (r.equals(BigInteger.valueOf(3)) || r.equals(BigInteger.valueOf(5))) {
					result = result.negate();
				}
			}
			BigInteger temp = m;
			m = n;
			n = temp;
			if (m.mod(BigInteger.TWO.add(BigInteger.TWO)).equals(BigInteger.valueOf(3))
					&& n.mod(BigInteger.TWO.add(BigInteger.TWO)).equals(BigInteger.valueOf(3))) {
				result = result.negate();
			}
			m = m.mod(n);
		}
		if (n.equals(BigInteger.ONE)) {
			return result;
		} else {
			return BigInteger.ZERO;
		}
	}

	// phi function for calculating d
	public static BigInteger phi(BigInteger p, BigInteger q) {
		return (p.subtract(BigInteger.ONE)).multiply((q.subtract(BigInteger.ONE)));
	}

	// extended euclidean to find the modular inverse of a number mod a number, used
	// to find d
	public static BigInteger extendedEuclidean(BigInteger n, BigInteger m) {
		ArrayList<BigInteger> p = new ArrayList<BigInteger>();
		ArrayList<BigInteger> q = new ArrayList<BigInteger>();
		BigInteger origmod = m;
		p.add(0, BigInteger.ZERO);
		p.add(1, BigInteger.ONE);
		for (int i = 0; i < 2; i++) {
			BigInteger temp = n;
			n = m.mod(n);
			q.add(i, m.divide(temp));
			m = temp;
		}
		int i = 2;
		while (!n.equals(BigInteger.ZERO)) {
			p.add(i, ((((p.get(i - 2).subtract(p.get(i - 1).multiply(q.get(i - 2)))).mod(origmod)).add(origmod)
					.mod(origmod))));
			q.add(i, m.divide(n));
			BigInteger temp2 = n;
			n = m.mod(n);
			m = temp2;
			i++;
		}
		// System.out.println(q.toString());
		return ((((p.get(i - 2).subtract(p.get(i - 1).multiply(q.get(i - 2)))).mod(origmod)).add(origmod)
				.mod(origmod)));

	}
}