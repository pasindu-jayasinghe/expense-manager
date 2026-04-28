
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function check() {
    const userId = '678d09d9-2bea-4257-916c-83331c370840';
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true, email: true }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log('User found:', user.email);
    console.log('Hash length:', user.password.length);
    console.log('Hash starts with:', user.password.substring(0, 7));

    const passwordsToTry = ['password123'];

    for (const pw of passwordsToTry) {
        const isValid = await bcrypt.compare(pw, user.password);
        console.log(`Password "${pw}" valid?`, isValid);
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
