"""
Leo Vanderlofske
Jack Warder
Comp 3501
Decrypting RSA using Genetic Algorithm
"""

import numpy as np
import sympy as sp
import random
import matplotlib.pyplot as plt
import time

n = 7571
prime_Punishment = np.floor(n*.0015)

#Weighted Choice function takes in parameters elements(a list of genomes) and 
#weights(a sorted list of fitness for those genomes)
def weightedChoice(elements, weights):
    # verify the lists are the same length
    assert len(elements) == len(weights)
    total = sum(weights)
    r = random.uniform(0, total)
    w = 0
    for i in range(len(elements)):
        w += weights[i]
        if w > r:
            return elements[i]
    # all weights are zero if we get here, so pick at random
    return random.choice(elements)

#Random Genomes function takes in public key n
#used to generate random starting integers for the first generation that will grow with the algorithm
def randomGenomes(n):
    #Generate p and q values as random integers between 2 and (n/2), 
    #since n/2 will be the largest prime possible withh 2 * n/2
    """ 
    Attempt at using prime factorization strategies
    testP = np.random.randint(2, np.sqrt(n)+1)
    testQ = np.random.randint(np.sqrt(n), (n/2)+1)
    if (testP%2 == 0 and not testP == 2):
        testP += 1
    if (testQ%2 == 0 and not testQ == 2):
        testQ += 1
    """
    testP = np.random.randint(2, (n/2)+1)
    testQ = np.random.randint(2, (n/2)+1)
    #Store those values as strings
    sTestP = str(testP)
    sTestQ = str(testQ)
    #Store the value of n/2 + 1 as a string to add leading 0s
    sn = str(int((n/2)+1))
    #Add leading 0s to p and q values if they dont match the length of n/2 + 1
    #For ease of crossover
    while len(sTestP) < len(sn):
        sTestP = ''.join(('0', sTestP))
        
    while len(sTestQ) < len(sn):
        sTestQ = ''.join(('0', sTestQ))
    
    #Reassign the strings and return as a tuple
    testP = sTestP
    testQ = sTestQ
        
    return (testP, testQ)

#Make Population function uses randomGenomes to create the initial population
#Takes parameters size (for population), and n to call randomGenomes
def makePopulation(size, n):
    #Creates a list of genomes the size of "size"
    population = [randomGenomes(n) for _ in range(size)]
    return population

#Fitness function takes in a genome as tuple, public key n, and a prime punishment for adjusting fitness values
#Used to judge the fitness of specific genomes, in order to find the strongest genomes for growth
def fitness(genome, n, primePunishment):
    #We take genome pair and convert to an integer
    p,q = genome
    q = int(q)
    p = int(p)
    #Take the distance between public key n and the product of our genome (aiming for 0)
    #Take absolute value to assure no negatives
    fitness = np.abs(n - (p*q))
    #Check if p and q are prime, add distance to fitness if not
    #Our aim is to grow closer to n, while also finding prime factors
    if (not sp.isprime(p)):
        fitness += primePunishment
    if (not sp.isprime(q)):
        fitness += primePunishment
    return fitness

#Evaluate Fitness function takes a whole population of genomes and pulbic key n
#Used to determine the average fitness and best individual fitness (with corresponding genome)
def evaluateFitness(population, n):
    #Start average fitness value at 0 (will go up)
    #Start bestFitness at 1 Billion (will go down)
    #Initialize best genome to use later
    avgFitness = 0
    bestFitness = 1000000000
    bestGenome = None
    #Loop through every genome in the population
    for genome in population:
        #Store the fitness value of the current genome, add to count for average fitness
        tempFitness = fitness(genome, n, prime_Punishment)
        avgFitness += tempFitness
        #Comparing the best fitness so far with current fitness value to find best value
        if (bestFitness > tempFitness):
            bestFitness = tempFitness
            bestGenome = genome
    #Return the average count / population size (true average), best fitness found and which genome that was
    return (avgFitness/len(population)), bestFitness, bestGenome

#Crossover function takes in two genomes to combine
def crossover(genome1, genome2):
    #Assign both values in the genome tuple to variables
    str1Gen1, str2Gen1 = genome1
    str1Gen2, str2Gen2 = genome2
    #Combine the p values for both genomes
    #Combine the q value for both genomes
    strGeno1 = str1Gen1 + str2Gen1
    strGeno2 = str1Gen2 + str2Gen2
    #Calculating a random spot to split the genomes
    split = np.random.randint(0, len(strGeno1))
    #Combining the halves of the genes and storing them into the new crossed over genes
    newGene1 = strGeno1[:split] + strGeno2[split:]
    newGene2 = strGeno2[:split] + strGeno1[split:]

    #Splitting the genes back into p and q values, returning as a tuple
    gene1 = (newGene1[:int(len(newGene1)/2)], newGene1[int(len(newGene1)/2):])
    gene2 = (newGene2[:int(len(newGene1)/2)], newGene2[int(len(newGene1)/2):])
    return (gene1, gene2)

#Mutate function takes in a genome and a mutation rate
#Used to change a digit of the integers at random
def mutate(genome, mutationRate):
    #Storing both values in the genome into separate variables
    #Initialize first newGene to an empty string
    part1, part2 = genome
    newGenept1 = ""
    #Traverse through every digit of the p value
    for i in part1:
        #Generate a random number between 0 and 1
        #If less than the mutation rate, go ahead and mutate that digit
        #Store new or old digit in empty string to create the new mutated genome
        randomNum = np.random.random()
        if randomNum < mutationRate:
            newGenept1 += str(random.randint(0, 9))
        else:
            newGenept1 += i
    #Empty string for q value
    newGenept2 = ""
    #Repeat steps for mutation from p value
    for i in part2:
        randomNum = np.random.random()
        if randomNum < mutationRate:
            newGenept2 += str(random.randint(0, 9))
        else:
            newGenept2 += i

    #Return the mutated genes as a tuple
    return (newGenept1, newGenept2)

#Select Pair function takes in a population of genomes
def selectPair(population):
    #Call function to sort the population by fitness values
    sortedPop, sortedFitness = sortByFitness(population)
    #Create a list of weights 1 to population length to use as weights to choose genomes
    #Since the population is now sorted by fitness, the weights correspond with the correct genomes
    listOfWeights = list(range(1, len(sortedPop) + 1))
    #Using the weighted choice function to select a pair of genomes using weights
    pair1 = weightedChoice(sortedPop, listOfWeights)
    pair2 = weightedChoice(sortedPop, listOfWeights)
    
    #Dont let the genomes be identical
    while (pair1 == pair2):
        pair2 = weightedChoice(sortedPop, listOfWeights)
    return pair1, pair2

#Sort By Fitness helper function takes in a population of genomes
#Sorts the population in order of fitness closest to 0 priority
def sortByFitness(genomes):
    #Storing the fitness value and the genome in a list of tuples (int, tuple)
    tuples = [(fitness(g, n, prime_Punishment), g) for g in genomes]
    #Sort the list in reverse order by weight
    tuples.sort(reverse=True)
    #Separating the fitness values and the genomes in order in two different lists for use
    sortedFitnessValues = [f for (f, g) in tuples]
    sortedGenomes = [g for (f, g) in tuples]
    return sortedGenomes, sortedFitnessValues
    
#Run Genetic Algorithm function brings everything togerther
#Takes in a population size, a crossover rate, a mutation rate, a public key n, and a file name
def runGA(populationSize, crossoverRate, mutationRate, n, logFile=""):
    #Initializing the file reading/writing system
    e = 2287
    message = "m"
    encryptedMessage = encrypt(message, e, n)
    print(f"Encrypted Message: {encryptedMessage}")
    log = None
    if logFile:
        #Opening file in append mode
        #Write the parameters to act as a title card for the data
        log = open(logFile, "a")
        log.write(f"\nPop size: {populationSize} Crossover Rate: {crossoverRate} Mutation Rate: {mutationRate}")
    else: 
        None
    if log:
        log.write("\n")
    #Initializing empty list to hold the best fitnesses per generation
    #storing the first random population
    #starting at the first generation
    #creating a flag to break out of the loop if 300 generation pass or p and q are properly found
    #Empty tuple to store final genome found
    bestFitnessList = []
    population = makePopulation(populationSize, n)
    generation = 1
    generation_max = False
    bestGenomeFinal = (0,0)
    #While loop to traverse through generations of new, adapted genomes
    while generation_max == False:
        #Getting the calculated values from evaluating the fitness of whole population
        avg, best, bestGenome = evaluateFitness(population, n)
        #Adding the best fitness found to the list for returning and testing
        bestFitnessList.append(best)
        #If we found the values for p and q, our fitness will be 0 for the best genome
        #Trigger flag to exit loop, record genome values, print final generation, 
        #queue decryption using the keys to calculate d
        if (best == 0):
            generation_max = True
            bestGenomeFinal = bestGenome
            print("P and Q Found!")
            print(f"Final Generation: {generation}, average fitness: {avg}, best fitness: {best}, p and q: {bestGenome} \n")
            p, q = bestGenomeFinal
            decriptMessage = decrypt(encryptedMessage,makeD(q,p,e), n)
            print(f"Decrypted Message {decriptMessage}")
        #Print/Write to file all of the evaluate fitness information
        if (generation_max == False):
            print(f"Generation: {generation}, average fitness: {avg}, best fitness: {best}, best genome: {bestGenome}")
        if log:
            log.write(f"Generation: {generation}, average fitness: {avg}, best fitness: {best}\n")
            log.flush()
        #Initializing the new population
        nextGen = []
        count = 0
        #Start while loop to traverse through the size of a population
        while count < populationSize:
            #Select a pair of genomes and crossover if the crossover rate is hit
            x, y = selectPair(population)
            if np.random.random() < crossoverRate:
                genome1, genome2 = crossover(x,y)
            else:
                genome1, genome2 =  x,y
            #Attempt to mutate both genomes, mutation rate is within mutate function
            genome1 = mutate(genome1, mutationRate)
            genome2 = mutate(genome2, mutationRate)
            #Add the genomes to the next generation
            nextGen.append(genome1)
            count += 1
            #In case the population size is odd
            if count < populationSize:
                nextGen.append(genome2)
                count += 1
        #Next generation
        generation += 1
        population = nextGen
        #If we reach generation 300 without success, break out of loop
        if generation == 301:
            generation_max = True
    if log:
        log.close()
    return bestFitnessList, bestGenomeFinal
    #raiseNotDefined()

#Encrypt function takes a message and both public keys adn returns the int value of encrypted message
def encrypt(message, e, n):
    #Initialize message to an "empty" int
    asciimessage = 0
    #Traverse through the message letter by letter
    for letter in message:
        #Get ascii value of the lertter
        ascival = ord(letter)
        print(f"letter: {letter} asci value: {bin(ascival)}")
        #Shifting the message left 7 and adding to our total ascii value
        asciimessage = (asciimessage << 7) + ascival
    print(f"asciimessage: {asciimessage}")
    #Return the ascii message to the power of e mod n
    return pow(asciimessage, e, n)

#Decryption function takes the encrypted message, public key n, and private key d and 
# returns the string value of the decrypted int message
def decrypt(encrypted_message, d, n):
    #Initialize empty message to return
    asciimessage = ""
    #Taking the message to the power of d mod n for decryption
    demessage = pow(encrypted_message, d, n)
    print("Decrypted integer:", demessage)
    while demessage > 0:
        #Extract the last 7 bits
        ascival = demessage & 0b1111111 
        print("asciVal: " + str(ascival))
        #Prepend character
        asciimessage = chr(ascival) + asciimessage 
        #Shift right by 7 bits
        demessage >>= 7 

    return asciimessage

def makeD(p, q, e):
    #calculating phi of n
    phiN = (int(q) - 1)*(int(p)-1)
    #finding the inverse of e mod(phi(n)) 
    d = pow(e, -1, phiN)
    print(f"Decryption Key: {d}")
    return d

"""
n = 7571
e = 2287
d = 4399
p = 113
q = 67
message = "h"
enc = encrypt(message, e, n)
print(f"encryption: {enc}")
dec = decrypt(enc, d, n)
print(f"decryption: {dec}")
print(randomGenomes(n))

"""
#print(bin(7571))
#print(bin(83849))
#print(bin(348169))

def plotValues(bestFitnessValues):
    # Define the generation numbers corresponding to the average fitness values
    generations = list(range(1, len(bestFitnessValues) + 1))

    # Create the plot
    plt.figure(figsize=(10, 6))
    plt.plot(generations, bestFitnessValues, linestyle='-', color='b', label='Best Fitness')

    # Add labels and title
    plt.xlabel('Generation')
    plt.ylabel('Best Fitness Fitness')
    plt.title('Average Fitness Over Generations')
    plt.legend()

    # Display the plot
    plt.grid(True)
    plt.show()
    
def testPopSize():
    #initilizing needed lists and values
    avgGenCount = 0
    currentBestPop = 1000000000
    bestGen = []
    #looping 10 times to test different values of population size
    for i in range(1, 11):
        #resetting values
        avgGenCount = 0
        currentBestPop = 100000000
        for _ in range(10):
            bestFitnessValues, bestGenome = runGA(100 * i,0.8,0.1,n, f"PopExperement{i}.txt")
            avgGenCount += len(bestFitnessValues)
            #saving best fitness value
            if (len(bestFitnessValues) < currentBestPop):
                bestGen = bestFitnessValues
        avgGen = avgGenCount/10
        #printing and plotting data
        print(f"Average Generation Found for PopSize{i*100}: {avgGen}")
        plotValues(bestGen)
        
def testCrossover():
    #initilizing needed lists and values
    avgGenCount = 0
    currentBestPop = 1000000000
    bestGen = []
    cross = 0.5
    #looping 6 times to test different values of Crossover rate 
    for i in range(6):
        #resetting values
        avgGenCount = 0
        currentBestPop = 100000000
        for _ in range(10):
            bestFitnessValues, bestGenome = runGA(700,cross,0.1,n, f"CrossExperement{i}.txt")
            avgGenCount += len(bestFitnessValues)
            #saving best fitness value
            if (len(bestFitnessValues) < currentBestPop):
                bestGen = bestFitnessValues
                currentBestPop = len(bestFitnessValues)
        avgGen = avgGenCount/10
        #printing and plotting data
        print(f"Average Generation Found for Crossover{cross}: {avgGen}")
        plotValues(bestGen)
        cross += 0.1
        
def testMutation():
    #initilizing needed lists and values
    avgGenCount = 0
    currentBestPop = 1000000000
    bestGen = []
    mute = 0.05
    #looping 4 times to test different values of mutation rate 
    for i in range(4):
        #resetting values
        avgGenCount = 0
        currentBestPop = 100000000
        for _ in range(10):
           bestFitnessValues, bestGenome = runGA(700,0.8,mute,n, f"MuteExperement{i}.txt")
           avgGenCount += len(bestFitnessValues)
           #saving best fitness value
           if (len(bestFitnessValues) < currentBestPop):
                bestGen = bestFitnessValues
        avgGen = avgGenCount/10
        #printing and plotting data
        print(f"Average Generation Found for Mutation{mute}: {avgGen}")
        plotValues(bestGen)
        mute += 0.05
        
def testPrimePunishment():
    #initilizing needed lists and values
    global prime_Punishment 
    avgGenCount = 0
    currentBestPop = 1000000000
    bestGen = []
    primeP = 0
    #looping 6 times to test different values of primePunishment
    for i in range(6):
        #resetting values
        avgGenCount = 0
        currentBestPop = 100000000
        prime_Punishment = primeP
        for _ in range(10):
           bestFitnessValues, bestGenome = runGA(700,0.8,0.1,n, f"primePExperiment{primeP}.txt")
           avgGenCount += len(bestFitnessValues)
           #saving best run
           if (len(bestFitnessValues) < currentBestPop):
                bestGen = bestFitnessValues
        #getting the average of all runs
        avgGen = avgGenCount/10
        #printting and plotting values
        print(f"Average Generation Found for primePunishment{primeP}: {avgGen}")
        plotValues(bestGen)
        primeP += n*0.0005

def TestTime():
    #initilizing needed lists and values
    avgGenCount = 0
    currentBestPop = 1000000000
    bestGen = []
    times = []
    #looping 10 times for experimental data
    for _ in range(10):
        #measuring time to see how time effeciant our algorithm is with bigger numbers
        startTime = int(time.time())
        bestFitnessValues, bestGenome = runGA(700, 0.8, 0.1, n, "timeExperiment1.txt")
        endTime = int(time.time())
        #adding the time taken to the list of times
        times.append(endTime - startTime)
        #finding the best run out of the 10 experiments
        avgGenCount += len(bestFitnessValues)
        if (len(bestFitnessValues) < currentBestPop):
            bestGen = bestFitnessValues
    #getting averge generation count
    avgGen = avgGenCount/10
    #printing data out in both text and chart form
    print(f"Average Generation Found for p,q < 200: {avgGen}")
    print(f"Average Time per Run{np.average(times)}")
    print(f"Total Time for 10 Runs: {np.sum(times)}")
    plotValues(bestGen)


bestFitnessValues, bestGenome = runGA(700,0.8,0.1,n)
plotValues(bestFitnessValues)
#testPopSize()
#testCrossover()
#testMutation()
#testPrimePunishment()
#TestTime()