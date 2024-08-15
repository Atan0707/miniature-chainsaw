const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, inspector, lender;
    let realEstate, escrow;

    beforeEach(async () => {
        // setup account
        [buyer, seller, inspector, lender] = await ethers.getSigners()
        

        // Deploy Real Estate
        const RealEstate = await ethers.getContractFactory('RealEstate')
        realEstate = await RealEstate.deploy()

        // Mint
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/1.json")
        await transaction.wait();

        const Escrow = await ethers.getContractFactory('Escrow')
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )

        transaction = await realEstate.connect(seller).approve(escrow.address, 1)
        await transaction.wait();

        transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5));
        await transaction.wait();
    })


    describe('Deployment', () => {
        it('return NFT address', async () => {
            const result = await escrow.nftAddress();
            expect(result).to.be.equal(realEstate.address)
        })

        it('return seller', async () => {
            const result = await escrow.seller();
            expect(result).to.be.equal(seller.address)
        })

        it('return inspector', async () => {
            const result = await escrow.inspector();
            expect(result).to.be.equal(inspector.address)
        })

        it('return lender', async () => {
            const result = await escrow.lender();
            expect(result).to.be.equal(lender.address)
        })
    })

    describe('Listing', () => {
        
        it('Updates is listed', async () => {
            const result = await escrow.isListed(1);
            expect(result).to.be.equal(true)
        })


        it('Updates ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)
        })

        it('Return buyer', async () => {
            const result = await escrow.buyer(1);
            expect(result).to.be.equal(buyer.address)
        })

        it('Return purchase price', async () => {
            const result = await escrow.purchasePrice(1);
            expect(result).to.be.equal(tokens(10))
        })

        it('Return escrow amount', async () => {
            const result = await escrow.escrowAmount(1);
            expect(result).to.be.equal(tokens(5))
        })

    })
 

    })
