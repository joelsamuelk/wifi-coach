"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expandable } from "@/components/wifi/expandable";
import { HelpCircle, Wifi, Router, Network } from "lucide-react";

const FAQ = [
  {
    icon: Wifi,
    question: "Why does Wi-Fi differ by room?",
    answer:
      "Wi-Fi signals weaken as they travel through walls, floors, and furniture. Thick concrete or brick walls block more signal than timber frames. Distance from the router also matters -- the further away, the weaker the signal. Even appliances like microwaves or baby monitors can interfere with Wi-Fi.",
  },
  {
    icon: HelpCircle,
    question: "What should my score be?",
    answer:
      "A score of 80 or above (Great) means your Wi-Fi is solid for streaming, video calls, and general use. Scores between 55-79 (Fair) are okay for browsing but may struggle with video calls. Below 55 (Weak) means you'll likely experience slow loading, buffering, and dropped connections.",
  },
  {
    icon: Router,
    question: "How to place your router",
    answer:
      "Place your router in a central, elevated location -- on a shelf or mounted on a wall. Keep it away from thick walls, metal objects, and other electronics. Don't hide it in a cupboard or behind the TV. If your home has multiple floors, place it on the floor where you use Wi-Fi most.",
  },
  {
    icon: Network,
    question: "Mesh vs extender -- what's the difference?",
    answer:
      "A Wi-Fi extender repeats your existing signal, which can halve your speed. A mesh system creates a seamless network with multiple access points that work together. Mesh is better for larger homes and gives a more consistent experience. Extenders are cheaper but less effective for whole-home coverage.",
  },
];

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Help & Troubleshooting
        </h1>
        <p className="text-sm text-muted-foreground">
          Common questions about Wi-Fi and how to improve it.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FAQ.map(({ icon: Icon, question, answer }) => (
          <Card key={question}>
            <CardContent className="py-3">
              <Expandable
                title={question}
                className="[&>button]:min-h-[44px]"
              >
                <div className="flex gap-3 rounded-lg bg-muted p-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-foreground">
                    {answer}
                  </p>
                </div>
              </Expandable>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-xs text-muted-foreground">
            WiFi Coach MVP &middot; Simple WiFi help for everyday homes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
