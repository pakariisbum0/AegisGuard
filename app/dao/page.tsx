"use client";

import { useState, useEffect } from "react";
import { DepartmentSystemActions } from "@/lib/contracts/actions";
import { ProposalWithMetadata, Department } from "@/lib/types";
import { ethers } from "ethers";
import { CreateProposalForm } from "@/app/components/CreateProposalForm";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Vote, Activity } from "lucide-react";
import { toast } from "sonner";
import { Space_Grotesk } from "next/font/google";
import { Header } from "../components/Header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

// Add this type for proposal states
type ProposalState = "Active" | "Executed" | "Expired" | "Pending Execution";

// Add these types at the top of the file
type EthPrice = {
  usd: number;
  lastUpdated: Date;
};

// Cache the ETH price to avoid too many API calls
let ethPriceCache: EthPrice | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const getEthPrice = async (): Promise<number> => {
  try {
    // Check cache first
    if (
      ethPriceCache &&
      new Date().getTime() - ethPriceCache.lastUpdated.getTime() <
        CACHE_DURATION
    ) {
      return ethPriceCache.usd;
    }

    // Fetch new price from CoinGecko API
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ETH price");
    }

    const data = await response.json();
    const price = data.ethereum.usd;

    // Update cache
    ethPriceCache = {
      usd: price,
      lastUpdated: new Date(),
    };

    return price;
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    // Fallback to last cached price or a default value
    return ethPriceCache?.usd || 2000;
  }
};

// Helper function to remove trailing zeros after decimal
const removeTrailingZeros = (numStr: string): string => {
  return numStr.replace(/\.?0+$/, "");
};

// Helper function to format large numbers for votes
const formatVotes = (votes: string | bigint): string => {
  try {
    // Convert to number and divide by 10^18 (standard token decimals)
    const value = Number(ethers.formatEther(votes.toString()));
    if (value >= 1_000_000_000) {
      return `${removeTrailingZeros((value / 1_000_000_000).toFixed(1))}B`;
    } else if (value >= 1_000_000) {
      return `${removeTrailingZeros((value / 1_000_000).toFixed(1))}M`;
    } else if (value >= 1_000) {
      return `${removeTrailingZeros((value / 1_000).toFixed(1))}K`;
    } else {
      return removeTrailingZeros(value.toFixed(1));
    }
  } catch (error) {
    console.error("Error formatting votes:", error);
    return "0";
  }
};

const formatToMillionsUSD = async (
  weiValue: string | number | bigint
): Promise<string> => {
  try {
    // Convert Wei to ETH first (divide by 10^18)
    const ethValue = Number(ethers.formatEther(weiValue.toString()));
    if (isNaN(ethValue)) {
      throw new Error("Invalid numeric value");
    }

    // Get current ETH price
    const ethPrice = await getEthPrice();

    // Calculate USD value and force to millions by dividing by 1e15
    // This effectively removes 15 zeros from the massive numbers
    const usdValue = (ethValue * ethPrice) / 1e15;

    // Format using Intl.NumberFormat for consistent currency formatting
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(usdValue);
  } catch (error) {
    console.error("Error formatting value:", error);
    return "N/A";
  }
};

const formatEthValue = (weiValue: string | number | bigint): string => {
  try {
    const ethValue = Number(ethers.formatEther(weiValue.toString()));
    if (ethValue >= 1_000_000_000) {
      return `${removeTrailingZeros(
        (ethValue / 1_000_000_000).toFixed(1)
      )}B ETH`;
    } else if (ethValue >= 1_000_000) {
      return `${removeTrailingZeros((ethValue / 1_000_000).toFixed(1))}M ETH`;
    } else if (ethValue >= 1_000) {
      return `${removeTrailingZeros((ethValue / 1_000).toFixed(1))}K ETH`;
    } else {
      return `${removeTrailingZeros(ethValue.toFixed(3))} ETH`;
    }
  } catch (error) {
    console.error("Error formatting ETH value:", error);
    return "N/A";
  }
};

const generateProposalAnalysisPrompt = (
  proposal: ProposalWithMetadata,
  departmentInfo: Department
) => {
  return `As a government spending analyst, evaluate this budget proposal and provide a recommendation:

PROPOSAL DETAILS:
- Department: ${proposal.departmentName}
- Current Budget: ${proposal.currentBudget}
- Proposed Budget: ${proposal.proposedBudget}
- Change Amount: ${
    Number(proposal.proposedBudget) - Number(proposal.currentBudget)
  }
- Current Department Efficiency: ${departmentInfo.efficiency}%
- Department Head: ${departmentInfo.departmentHead}

VOTING STATUS:
- Votes For: ${proposal.votesFor}
- Votes Against: ${proposal.votesAgainst}
- Time Remaining: ${proposal.timeRemaining}

HISTORICAL CONTEXT:
- Department's Previous Budget Utilization: ${departmentInfo.efficiency}%
- Number of Active Projects: ${departmentInfo.activeProjects || 0}
- Previous Proposals Status: ${departmentInfo.previousProposals || "N/A"}

Please analyze this proposal and provide:
1. RECOMMENDATION: A clear "PASS" or "FAIL" recommendation
2. CONFIDENCE SCORE: Rate your confidence in this recommendation (1-100%)
3. KEY FACTORS: List the top 3 factors influencing your recommendation
4. RISKS: Identify potential risks if this proposal passes
5. OPPORTUNITIES: Highlight potential benefits if implemented
6. EFFICIENCY IMPACT: How might this affect department efficiency
7. ALTERNATIVE SUGGESTION: If recommending FAIL, suggest an alternative

Format your response as:
RECOMMENDATION: [PASS/FAIL]
CONFIDENCE: [Score]%
ANALYSIS: [2-3 sentences summarizing key points]
KEY FACTORS:
- [Factor 1]
- [Factor 2]
- [Factor 3]
RISKS: [Bulleted list]
OPPORTUNITIES: [Bulleted list]
EFFICIENCY IMPACT: [1-2 sentences]
ALTERNATIVE: [If FAIL, provide suggestion]`;
};

// Function to get AI analysis
const getProposalAIAnalysis = async (
  proposal: ProposalWithMetadata,
  departmentInfo: Department
): Promise<string> => {
  try {
    const prompt = generateProposalAnalysisPrompt(proposal, departmentInfo);

    if (
      !process.env.NEXT_PUBLIC_AI_ENDPOINT ||
      !process.env.NEXT_PUBLIC_AI_CREDENTIALS
    ) {
      throw new Error("AI configuration is missing");
    }

    const response = await fetch(process.env.NEXT_PUBLIC_AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(process.env.NEXT_PUBLIC_AI_CREDENTIALS)}`,
      },
      body: JSON.stringify({
        message: prompt,
      }),
    });

    if (!response.ok) {
      console.error("AI API Error:", response.status, await response.text());
      return "Error getting AI analysis.";
    }

    const data = await response.json();
    return data.response || "No analysis available.";
  } catch (error) {
    console.error("Error getting AI analysis:", error);
    return "Error processing AI analysis.";
  }
};

// Add type for AI analysis result
type AIAnalysisResult = {
  recommendation: "PASS" | "FAIL";
  confidence: number;
  analysis: string;
  keyFactors: string[];
};

// Add this function to parse AI response
const parseAIResponse = (response: string): AIAnalysisResult | null => {
  try {
    const recommendation = response.match(
      /RECOMMENDATION: (PASS|FAIL)/
    )?.[1] as "PASS" | "FAIL";
    const confidence = parseInt(
      response.match(/CONFIDENCE: (\d+)%/)?.[1] || "0"
    );
    const analysis =
      response.match(/ANALYSIS: (.*?)(?=KEY FACTORS:)/s)?.[1]?.trim() || "";
    const keyFactorsMatch = response.match(/KEY FACTORS:(.*?)(?=RISKS:)/s);
    const keyFactors =
      keyFactorsMatch?.[1]
        ?.split("-")
        .map((factor) => factor.trim())
        .filter((factor) => factor.length > 0) || [];

    return { recommendation, confidence, analysis, keyFactors };
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return null;
  }
};

export default function DAODashboard() {
  const [activeProposals, setActiveProposals] = useState<
    ProposalWithMetadata[]
  >([]);
  const [votingPower, setVotingPower] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [userAddress, setUserAddress] = useState<string>("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showCreateProposal, setShowCreateProposal] = useState(false);

  const refreshData = async () => {
    try {
      setLoading(true);
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      // Get user address and voting power
      const address = await signer.getAddress();
      setUserAddress(address);
      const power = await departmentSystem.getVotingPower(address);
      setVotingPower(power);

      // Get departments
      const deps = await departmentSystem.fetchAllDepartments();
      const activeDeps = deps
        .filter((d) => d.isActive)
        .sort((a, b) => a.name.localeCompare(b.name));
      setDepartments(activeDeps);

      // Get active proposals
      const proposals = await departmentSystem.getActiveProposals();
      console.log("Raw proposals:", proposals);

      // Map proposals to include department details and format numbers
      const proposalsWithMetadata = await Promise.all(
        proposals.map(async (proposal) => {
          const department = activeDeps.find(
            (d) =>
              d.departmentHead.toLowerCase() ===
              proposal.department.toLowerCase()
          );

          // Safely handle BigInt conversions
          const currentBudget = department?.budget
            ? BigInt(department.budget.toString().split(".")[0]) // Remove decimal part
            : BigInt(0);

          // Get user's vote for this proposal
          const hasVoted = await departmentSystem.hasVoted(
            proposal.id,
            userAddress
          );
          const userVote = hasVoted
            ? await departmentSystem.getUserVote(proposal.id, userAddress)
            : undefined;

          return {
            ...proposal,
            departmentName: department?.name || "Unknown Department",
            currentBudget: ethers
              .formatEther(currentBudget)
              .replace(/\.0$/, ""),
            votingPowerFor: ethers
              .formatEther(BigInt(proposal.votesFor.toString()))
              .replace(/\.0$/, ""),
            votingPowerAgainst: ethers
              .formatEther(BigInt(proposal.votesAgainst.toString()))
              .replace(/\.0$/, ""),
            proposedBudget: BigInt(proposal.proposedBudget.toString()),
            timeRemaining: formatTimeRemaining(
              proposal.endTime - Math.floor(Date.now() / 1000)
            ),
            status: getProposalStatus(proposal),
            userVote, // Add user's vote
          };
        })
      );

      console.log("Processed proposals:", proposalsWithMetadata);
      setActiveProposals(proposalsWithMetadata);
    } catch (error) {
      console.error("Failed to refresh DAO data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return "Ended";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  const getProposalStatus = (proposal: ProposalWithMetadata): ProposalState => {
    const now = Math.floor(Date.now() / 1000);
    if (proposal.executed) return "Executed";
    if (proposal.endTime < now) {
      // Check if proposal passed but hasn't been executed
      const totalVotes =
        Number(proposal.votingPowerFor) + Number(proposal.votingPowerAgainst);
      if (
        totalVotes > 0 &&
        Number(proposal.votingPowerFor) > Number(proposal.votingPowerAgainst)
      ) {
        return "Pending Execution";
      }
      return "Expired";
    }
    return "Active";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header Skeleton */}
            <div className="mb-8 animate-pulse">
              <div className="h-8 w-1/3 bg-gray-200 rounded mb-4" />
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 border border-gray-100"
                >
                  <div className="h-4 w-1/3 bg-gray-200 rounded mb-4" />
                  <div className="h-8 w-1/2 bg-gray-100 rounded" />
                </div>
              ))}
            </div>

            {/* Proposals Skeleton */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 border border-gray-100"
                >
                  <div className="flex justify-between mb-4">
                    <div className="h-6 w-1/3 bg-gray-200 rounded" />
                    <div className="h-6 w-24 bg-gray-100 rounded" />
                  </div>
                  <div className="h-20 bg-gray-50 rounded" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const stats = [
    {
      label: "Active Proposals",
      value: activeProposals.length,
      icon: FileText,
      description: "Proposals requiring votes",
    },
    {
      label: "Your Voting Power",
      value: Number(votingPower).toFixed(2),
      icon: Vote,
      description: "DOGE tokens for voting",
    },
    {
      label: "Total Departments",
      value: departments.length,
      icon: Activity,
      description: "Participating departments",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Enhanced Header Section */}
          <div className="flex flex-col gap-8 mb-8">
            <div>
              <h1
                className={`text-3xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                DAO Governance
              </h1>
              <p className="mt-2 text-gray-600">
                Participate in department budget decisions and governance
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {stat.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Create Proposal Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setShowCreateProposal(!showCreateProposal)}
                className="bg-black"
              >
                {showCreateProposal ? "Cancel" : "Create New Proposal"}
              </Button>
            </div>
          </div>

          {showCreateProposal && (
            <CreateProposalSection
              departments={departments}
              onProposalCreated={refreshData}
            />
          )}

          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="bg-white">
              <TabsTrigger value="active">
                Active Proposals ({activeProposals.length})
              </TabsTrigger>
              <TabsTrigger value="history">Your History</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Active Proposals</h2>
                  <p className="text-gray-500">
                    Current proposals requiring votes
                  </p>
                </CardHeader>
                <CardContent>
                  {activeProposals.length > 0 ? (
                    <div className="grid gap-6">
                      {activeProposals.map((proposal) => (
                        <ProposalCard
                          key={proposal.id}
                          proposal={proposal}
                          userAddress={userAddress}
                          onVoteSuccess={refreshData}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        No active proposals at the moment.
                      </p>
                      <Button
                        onClick={() => setShowCreateProposal(true)}
                        variant="outline"
                        className="mt-4"
                      >
                        Create your first proposal
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Your Voting History</h2>
                  <p className="text-gray-500">
                    Past proposals you've voted on
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      You haven't voted on any proposals yet
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Recent Activity</h2>
                  <p className="text-gray-500">Latest DAO governance actions</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      No recent activity to display
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function ProposalCard({
  proposal,
  userAddress,
  onVoteSuccess,
}: {
  proposal: ProposalWithMetadata;
  userAddress: string;
  onVoteSuccess?: () => void;
}) {
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votingFor, setVotingFor] = useState<boolean>(false);
  const [votingAgainst, setVotingAgainst] = useState<boolean>(false);
  const [formattedBudgets, setFormattedBudgets] = useState({
    current: "Loading...",
    proposed: "Loading...",
  });
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [autoVoteEnabled, setAutoVoteEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`autoVote_${proposal.id}`) === "true";
    }
    return false;
  });
  const [parsedAIAnalysis, setParsedAIAnalysis] =
    useState<AIAnalysisResult | null>(null);

  // Add useEffect to format budgets
  useEffect(() => {
    const formatBudgets = async () => {
      const current = await formatToMillionsUSD(proposal.currentBudget);
      const proposed = await formatToMillionsUSD(proposal.proposedBudget);
      setFormattedBudgets({ current, proposed });
    };
    formatBudgets();
  }, [proposal.currentBudget, proposal.proposedBudget]);

  useEffect(() => {
    checkVoteStatus();
  }, [proposal.id, userAddress]);

  const checkVoteStatus = async () => {
    try {
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);
      const voted = await departmentSystem.hasVoted(proposal.id, userAddress);
      setHasVoted(voted);
    } catch (error) {
      console.error("Failed to check vote status:", error);
    }
  };

  const handleVote = async (support: boolean) => {
    try {
      if (support) {
        setVotingFor(true);
      } else {
        setVotingAgainst(true);
      }

      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      const tx = await departmentSystem.voteOnProposal(proposal.id, support);
      await tx.wait();

      setHasVoted(true);

      toast.success(
        <div className="space-y-2">
          <p className="font-medium">Vote submitted successfully!</p>
          <p className="text-sm">
            You voted {support ? "FOR" : "AGAINST"} the proposal to change{" "}
            {proposal.departmentName}'s budget to {formattedBudgets.proposed}
          </p>
          <p className="text-xs text-gray-500">
            Current results: {proposal.votesFor.toString()} For /{" "}
            {proposal.votesAgainst.toString()} Against
          </p>
        </div>,
        {
          duration: 5000,
        }
      );

      onVoteSuccess?.();
    } catch (error) {
      console.error("Failed to vote:", error);
      toast.error("Failed to submit vote. Please try again.");
    } finally {
      if (support) {
        setVotingFor(false);
      } else {
        setVotingAgainst(false);
      }
    }
  };

  const getStatusColor = (status: ProposalState) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Executed":
        return "bg-blue-100 text-blue-800";
      case "Pending Execution":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleExecute = async () => {
    try {
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      const tx = await departmentSystem.executeProposal(proposal.id);
      await tx.wait();

      toast.success("Proposal executed successfully!");
      onVoteSuccess?.(); // Refresh the proposals list
    } catch (error) {
      console.error("Failed to execute proposal:", error);
      toast.error("Failed to execute proposal");
    }
  };

  // Update existing useEffect for AI analysis
  useEffect(() => {
    const handleAutoVote = async () => {
      if (!proposal.department) return;

      setLoadingAnalysis(true);
      try {
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);
        const departmentInfo = await departmentSystem.getDepartmentDetails(
          proposal.department
        );

        const analysis = await getProposalAIAnalysis(proposal, departmentInfo);
        setAiAnalysis(analysis);

        // Parse the AI response
        const parsed = parseAIResponse(analysis);
        setParsedAIAnalysis(parsed);

        // Show vote modal immediately if we got a valid recommendation
        if (parsed && !hasVoted) {
          setShowVoteModal(true);
          toast.success(
            "AI recommendation ready! Please review and confirm your vote."
          );
        } else {
          toast.error("Could not get a clear recommendation from AI");
        }
      } catch (error) {
        console.error("Error fetching AI analysis:", error);
        toast.error("Failed to get AI recommendation");
        setAutoVoteEnabled(false);
        localStorage.setItem(`autoVote_${proposal.id}`, "false");
      } finally {
        setLoadingAnalysis(false);
      }
    };

    handleAutoVote();
  }, [proposal.id, autoVoteEnabled, hasVoted]);

  // Update auto-vote toggle UI to show more information
  const handleAutoVoteToggle = async (enabled: boolean) => {
    setAutoVoteEnabled(enabled);
    localStorage.setItem(`autoVote_${proposal.id}`, enabled.toString());

    if (!enabled) {
      setShowVoteModal(false);
      return;
    }

    // Always trigger AI analysis when enabling
    setLoadingAnalysis(true);
    try {
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);
      const departmentInfo = await departmentSystem.getDepartmentDetails(
        proposal.department
      );

      const analysis = await getProposalAIAnalysis(proposal, departmentInfo);
      setAiAnalysis(analysis);

      const parsed = parseAIResponse(analysis);
      setParsedAIAnalysis(parsed);

      // Show vote modal immediately if we got a valid recommendation
      if (parsed && !hasVoted) {
        setShowVoteModal(true);
        toast.success(
          "AI recommendation ready! Please review and confirm your vote."
        );
      } else {
        toast.error("Could not get a clear recommendation from AI");
      }
    } catch (error) {
      console.error("Error fetching AI analysis:", error);
      toast.error("Failed to get AI recommendation");
      setAutoVoteEnabled(false);
      localStorage.setItem(`autoVote_${proposal.id}`, "false");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Update vote modal to be more informative
  const renderVoteModal = () => (
    <Dialog open={showVoteModal} onOpenChange={setShowVoteModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Voting Recommendation</DialogTitle>
          <DialogDescription>
            {parsedAIAnalysis && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="font-medium flex items-center gap-2">
                    <span
                      className={
                        parsedAIAnalysis.recommendation === "PASS"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      Recommendation: {parsedAIAnalysis.recommendation}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({parsedAIAnalysis.confidence}% confidence)
                    </span>
                  </p>
                  <p className="mt-2 text-sm">{parsedAIAnalysis.analysis}</p>
                  {parsedAIAnalysis.keyFactors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Key Factors:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {parsedAIAnalysis.keyFactors.map((factor, i) => (
                          <li key={i}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      handleVote(parsedAIAnalysis.recommendation === "PASS");
                      setShowVoteModal(false);
                    }}
                    className={`flex-1 ${
                      parsedAIAnalysis.recommendation === "PASS"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    Accept & Vote{" "}
                    {parsedAIAnalysis.recommendation === "PASS"
                      ? "For"
                      : "Against"}
                  </Button>
                  <Button
                    onClick={() => setShowVoteModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Vote Manually
                  </Button>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );

  // Add this function back before the return statement in ProposalCard
  const renderAIAnalysis = () => (
    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-blue-600" />
        <h4 className="text-sm font-medium text-gray-900">AI Analysis</h4>
      </div>
      {loadingAnalysis ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing proposal...
        </div>
      ) : parsedAIAnalysis ? (
        <div className="text-sm text-gray-600 space-y-4">
          {/* Recommendation Section */}
          <div className="bg-white p-3 rounded-md border border-gray-100">
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  parsedAIAnalysis.recommendation === "PASS"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {parsedAIAnalysis.recommendation}
              </span>
              <span className="text-gray-500 text-sm">
                {parsedAIAnalysis.confidence}% confidence
              </span>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="bg-white p-3 rounded-md border border-gray-100">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Analysis</h5>
            <p className="text-gray-600">{parsedAIAnalysis.analysis}</p>
          </div>

          {/* Key Factors Section */}
          {parsedAIAnalysis.keyFactors.length > 0 && (
            <div className="bg-white p-3 rounded-md border border-gray-100">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Key Factors
              </h5>
              <ul className="space-y-1">
                {parsedAIAnalysis.keyFactors.map((factor, i) => (
                  <li key={i} className="text-gray-600 flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-600 bg-white p-3 rounded-md border border-gray-100">
          {aiAnalysis || "No analysis available"}
        </div>
      )}
    </div>
  );

  // Add this function before the return statement in ProposalCard
  const renderAutoVoteToggle = () => (
    <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="space-y-1">
        <p className="text-sm font-medium">AI-Assisted Voting</p>
        <p className="text-xs text-gray-500">
          {loadingAnalysis
            ? "Getting AI recommendation..."
            : autoVoteEnabled
            ? "AI will suggest votes automatically"
            : "Enable to get AI voting suggestions"}
        </p>
        {autoVoteEnabled && parsedAIAnalysis && (
          <p className="text-xs text-blue-600">
            Current recommendation: {parsedAIAnalysis.recommendation}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {loadingAnalysis && (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        )}
        <Switch
          checked={autoVoteEnabled}
          onCheckedChange={handleAutoVoteToggle}
          disabled={hasVoted || loadingAnalysis}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">
                Budget Proposal for {proposal.departmentName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">
                  Current Budget: {formattedBudgets.current}
                  <span className="text-xs text-gray-500 ml-1">
                    ({formatEthValue(proposal.currentBudget)})
                  </span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                    proposal.status
                  )}`}
                >
                  {proposal.status}
                </span>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {proposal.timeRemaining}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            {/* <div>
              <p className="text-sm text-gray-600">Proposed Budget</p>
              <p className="font-medium text-gray-900">
                {formattedBudgets.proposed}
              </p>
            </div> */}
            <div>
              <p className="text-sm text-gray-600">Current Votes</p>
              <p className="font-medium text-gray-900">
                {formatVotes(proposal.votesFor)} For
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time Remaining</p>
              <p className="font-medium text-gray-900">
                {proposal.timeRemaining}
              </p>
            </div>
          </div>

          {renderAIAnalysis()}
          {renderAutoVoteToggle()}
          {renderVoteModal()}

          {proposal.status === "Active" && !hasVoted && (
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => handleVote(true)}
                disabled={votingFor || votingAgainst}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {votingFor ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Vote For
              </Button>
              <Button
                onClick={() => handleVote(false)}
                disabled={votingFor || votingAgainst}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {votingAgainst ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Vote Against
              </Button>
            </div>
          )}

          {hasVoted && (
            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-600">
                You voted{" "}
                {proposal.votesFor.toString() > "0" ? "FOR" : "AGAINST"} this
                proposal
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Total votes: {formatVotes(proposal.votesFor)} For /{" "}
                {formatVotes(proposal.votesAgainst)} Against
              </p>
            </div>
          )}

          {proposal.status === "Pending Execution" && (
            <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 mb-2">
                This proposal has passed and is ready for execution!
              </p>
              <Button
                onClick={handleExecute}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Execute Proposal
              </Button>
            </div>
          )}

          {proposal.status === "Executed" && (
            <div className="mt-4 bg-green-50 p-2 rounded text-center">
              <p className="text-green-600">
                This proposal has been executed successfully
              </p>
              <p className="text-sm text-green-500 mt-1">
                New budget: {formattedBudgets.current}
              </p>
            </div>
          )}

          {proposal.status === "Expired" && (
            <div className="mt-4 bg-gray-50 p-2 rounded text-center">
              <p className="text-gray-600">
                This proposal has expired without execution
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Final vote: {formatVotes(proposal.votesFor)} For vs{" "}
                {formatVotes(proposal.votesAgainst)} Against
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateProposalSection({
  departments,
  onProposalCreated,
}: {
  departments: Department[];
  onProposalCreated?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Budget Proposal
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Submit a new proposal to modify department budgets
          </p>
        </div>
      </div>
      <CreateProposalForm
        departments={departments}
        onProposalCreated={onProposalCreated}
      />
    </div>
  );
}
