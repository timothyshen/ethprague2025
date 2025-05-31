import React from 'react'
import { TwitterIcon } from 'lucide-react'


const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">About AnyStaking</h3>
                        <p className="text-gray-400">
                            AnyStaking is a cross-chain staking protocol that allows users to stake their ETH from any chain into our Ethereum staking pool.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><a href="/" className="hover:text-gray-300">Home</a></li>
                            <li><a href="/about" className="hover:text-gray-300">About</a></li>
                            <li><a href="/contact" className="hover:text-gray-300">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="https://x.com/AnyStaking" className="hover:text-gray-300">
                                <TwitterIcon className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </div>
                <p className="text-center text-gray-400 mt-8"> @2025 AnyStaking. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer